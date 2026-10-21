import pytest

from app.extensions import db
from app.models.newsletter import NewsletterSubscriber
from app.services import captcha_service
from app.services.newsletter_service import subscribe


def _subscribe(client, **overrides):
    return client.post(
        "/api/newsletter", json={"email": "Reader@Example.com", "consent": True, "captcha": "token", **overrides}
    )


def test_subscribing_records_the_email_and_consent_time(client):
    response = _subscribe(client)

    assert response.status_code == 201
    subscriber = NewsletterSubscriber.query.one()
    assert subscriber.email == "reader@example.com"
    assert subscriber.consented_at is not None


def test_subscribing_twice_keeps_one_row_and_gives_the_same_reply(client):
    first = _subscribe(client)
    first_consent = NewsletterSubscriber.query.one().consented_at

    second = _subscribe(client, email="reader@example.com")

    assert second.status_code == first.status_code == 201
    assert second.get_json()["message"] == first.get_json()["message"]
    subscriber = NewsletterSubscriber.query.one()
    assert subscriber.consented_at >= first_consent


@pytest.mark.parametrize(
    "overrides, field",
    [
        ({"consent": False}, "consent"),
        ({"consent": None}, "consent"),
        ({"email": "nope"}, "email"),
        ({"email": ""}, "email"),
    ],
)
def test_invalid_subscriptions_are_rejected(client, overrides, field):
    response = _subscribe(client, **overrides)

    assert response.status_code == 422
    assert field in response.get_json()["errors"]
    assert NewsletterSubscriber.query.count() == 0


def test_consent_is_required(client):
    response = client.post("/api/newsletter", json={"email": "reader@example.com"})
    assert response.status_code == 422
    assert "consent" in response.get_json()["errors"]


def test_captcha_is_checked_when_configured(app, client, monkeypatch):
    app.config["CAPTCHA_SECRET_KEY"] = "secret"
    monkeypatch.setattr(captcha_service, "_ask_provider", lambda token, ip: False)

    assert _subscribe(client).status_code == 400
    assert NewsletterSubscriber.query.count() == 0


@pytest.mark.config(RATELIMIT_ENABLED=True, NEWSLETTER_RATE_LIMIT="2 per minute")
def test_subscribing_is_rate_limited(client):
    assert _subscribe(client, email="one@example.com").status_code == 201
    assert _subscribe(client, email="two@example.com").status_code == 201
    assert _subscribe(client, email="three@example.com").status_code == 429


@pytest.mark.parametrize(
    "method, path", [("get", "/api/newsletter"), ("get", "/api/newsletter/export"), ("delete", "/api/newsletter/1")]
)
def test_admin_endpoints_need_an_admin(client, reader_headers, method, path):
    assert getattr(client, method)(path).status_code == 401
    assert getattr(client, method)(path, headers=reader_headers).status_code == 403


def test_admin_lists_subscribers(client, admin_headers):
    subscribe("first@example.com")
    subscribe("second@example.com")

    data = client.get("/api/newsletter?per_page=1", headers=admin_headers).get_json()["data"]

    assert data["meta"]["total"] == 2
    assert data["meta"]["pages"] == 2
    assert data["subscribers"][0]["email"] == "second@example.com"
    assert data["subscribers"][0]["consented_at"]


def test_admin_exports_subscribers(client, admin_headers):
    subscribe("first@example.com")

    response = client.get("/api/newsletter/export", headers=admin_headers)

    assert response.status_code == 200
    assert response.mimetype == "text/csv"
    text = response.get_data(as_text=True)
    assert text.startswith("﻿Email,Consented at,Subscribed at")
    assert "first@example.com" in text


def test_admin_removes_a_subscriber(client, admin_headers):
    subscriber = subscribe("leaving@example.com")

    assert client.delete(f"/api/newsletter/{subscriber.id}", headers=admin_headers).status_code == 200
    assert db.session.get(NewsletterSubscriber, subscriber.id) is None
    assert client.delete(f"/api/newsletter/{subscriber.id}", headers=admin_headers).status_code == 404
