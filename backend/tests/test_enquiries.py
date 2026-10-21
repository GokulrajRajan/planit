import pytest

from app.models.enquiry import Enquiry
from app.services import captcha_service, enquiry_service
from app.services.enquiry_service import create_enquiry, set_enquiry_handled

VALID = {
    "name": "Priya Raman",
    "phone": "+91 98765 43210",
    "email": "priya@example.com",
    "city": "Chennai",
    "service": "sip_planning",
    "message": "I'd like to start a monthly SIP.",
    "captcha": "token-from-widget",
}


def _post(client, **overrides):
    return client.post("/api/enquiries", json={**VALID, **overrides})


@pytest.fixture
def sent_emails(monkeypatch):
    sent = []
    monkeypatch.setattr(enquiry_service, "send_email", lambda **kwargs: sent.append(kwargs) or True)
    return sent


def test_enquiry_is_stored_and_office_is_emailed(client, sent_emails):
    response = _post(client)

    assert response.status_code == 201
    assert response.get_json()["data"] is None
    enquiry = Enquiry.query.one()
    assert (enquiry.name, enquiry.phone, enquiry.service) == ("Priya Raman", "+91 98765 43210", "sip_planning")
    assert enquiry.notified_at is not None
    assert enquiry.handled is False

    [email] = sent_emails
    assert email["to"] == ["office@example.com"]
    assert email["reply_to"] == "priya@example.com"
    assert "SIP Planning" in email["body"]


def test_enquiry_is_kept_when_the_email_fails(client, monkeypatch):
    monkeypatch.setattr(enquiry_service, "send_email", lambda **kwargs: False)

    assert _post(client).status_code == 201
    assert Enquiry.query.one().notified_at is None


def test_optional_fields_can_be_left_blank(client, sent_emails):
    response = _post(client, city="", service=None, message="   ")

    assert response.status_code == 201
    enquiry = Enquiry.query.one()
    assert (enquiry.city, enquiry.service, enquiry.message) == (None, None, None)


@pytest.mark.parametrize(
    "overrides, field",
    [
        ({"phone": ""}, "phone"),
        ({"phone": "call me"}, "phone"),
        ({"email": "not-an-email"}, "email"),
        ({"name": "A"}, "name"),
        ({"service": "crypto"}, "service"),
        ({"message": "x" * 2001}, "message"),
    ],
)
def test_invalid_enquiries_are_rejected(client, overrides, field):
    response = _post(client, **overrides)

    assert response.status_code == 422
    assert field in response.get_json()["errors"]
    assert Enquiry.query.count() == 0


def test_captcha_is_checked_when_configured(app, client, monkeypatch, sent_emails):
    app.config["CAPTCHA_SECRET_KEY"] = "secret"
    calls = []
    monkeypatch.setattr(captcha_service, "_ask_provider", lambda token, ip: calls.append(token) or False)

    response = _post(client)
    assert response.status_code == 400
    assert "captcha" in response.get_json()["errors"]

    missing = _post(client, captcha=None)
    assert missing.status_code == 400

    assert calls == ["token-from-widget"]  # a missing token never reaches the provider
    assert Enquiry.query.count() == 0


def test_valid_captcha_is_accepted(app, client, monkeypatch, sent_emails):
    app.config["CAPTCHA_SECRET_KEY"] = "secret"
    monkeypatch.setattr(captcha_service, "_ask_provider", lambda token, ip: token == "token-from-widget")

    assert _post(client).status_code == 201


def test_forms_are_refused_in_production_without_a_captcha_key(app, client, sent_emails):
    app.config["CAPTCHA_OPTIONAL"] = False  # as in ProductionConfig

    assert _post(client).status_code == 503
    assert Enquiry.query.count() == 0


@pytest.mark.config(RATELIMIT_ENABLED=True, ENQUIRY_RATE_LIMIT="2 per minute")
def test_enquiries_are_rate_limited(client, sent_emails):
    assert _post(client).status_code == 201
    assert _post(client).status_code == 201

    response = _post(client)
    assert response.status_code == 429
    assert Enquiry.query.count() == 2


@pytest.mark.parametrize(
    "method, path",
    [("get", "/api/enquiries"), ("get", "/api/enquiries/export"), ("patch", "/api/enquiries/1")],
)
def test_admin_endpoints_need_an_admin(client, reader_headers, method, path):
    assert getattr(client, method)(path, json={"handled": True}).status_code == 401
    assert getattr(client, method)(path, json={"handled": True}, headers=reader_headers).status_code == 403


def _seed():
    first = create_enquiry({**VALID, "name": "First Person"})
    second = create_enquiry({**VALID, "name": "Second Person"})
    set_enquiry_handled(first, True)
    return first, second


def test_admin_lists_and_filters_enquiries(client, admin_headers):
    first, second = _seed()

    everything = client.get("/api/enquiries", headers=admin_headers).get_json()["data"]
    assert [e["name"] for e in everything["enquiries"]] == ["Second Person", "First Person"]
    assert everything["meta"]["total"] == 2
    assert "captcha" not in everything["enquiries"][0]

    new = client.get("/api/enquiries?status=new", headers=admin_headers).get_json()["data"]["enquiries"]
    handled = client.get("/api/enquiries?status=handled", headers=admin_headers).get_json()["data"]["enquiries"]
    assert [e["id"] for e in new] == [second.id]
    assert [e["id"] for e in handled] == [first.id]

    assert client.get("/api/enquiries?status=archived", headers=admin_headers).status_code == 400


def test_admin_paginates_enquiries(client, admin_headers):
    _seed()

    data = client.get("/api/enquiries?per_page=1&page=2", headers=admin_headers).get_json()["data"]
    assert data["meta"] == {"page": 2, "per_page": 1, "total": 2, "pages": 2}
    assert len(data["enquiries"]) == 1


def test_admin_marks_an_enquiry_handled_and_back(client, admin_headers):
    enquiry = create_enquiry(VALID)

    handled = client.patch(f"/api/enquiries/{enquiry.id}", json={"handled": True}, headers=admin_headers)
    assert handled.status_code == 200
    assert handled.get_json()["data"]["enquiry"]["handled"] is True
    assert handled.get_json()["data"]["enquiry"]["handled_at"]

    reopened = client.patch(f"/api/enquiries/{enquiry.id}", json={"handled": False}, headers=admin_headers)
    assert reopened.get_json()["data"]["enquiry"]["handled_at"] is None

    assert client.patch(f"/api/enquiries/{enquiry.id}", json={}, headers=admin_headers).status_code == 422
    assert client.patch("/api/enquiries/999", json={"handled": True}, headers=admin_headers).status_code == 404


def test_admin_exports_enquiries_as_csv(client, admin_headers):
    create_enquiry({**VALID, "name": '=HYPERLINK("http://evil.example","click")'})

    response = client.get("/api/enquiries/export", headers=admin_headers)

    assert response.status_code == 200
    assert response.mimetype == "text/csv"
    assert response.headers["Content-Disposition"].startswith('attachment; filename="enquiries-')
    text = response.get_data(as_text=True)
    assert text.startswith("﻿Received,Name,Phone,Email,City,Service,Message,Handled")
    assert "'=HYPERLINK" in text  # neutralised so a spreadsheet won't run it
    assert "+91 98765 43210" in text and "'+91" not in text
    assert "SIP Planning" in text
