from datetime import datetime, timedelta, timezone

import pytest

from app.extensions import db
from app.models.announcement import Announcement, AnnouncementPlacement


def _add(text, **fields) -> Announcement:
    announcement = Announcement(text=text, **fields)
    db.session.add(announcement)
    db.session.commit()
    return announcement


def _utc(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    # SQLite (used for quick local runs) returns naive values, which are stored as UTC.
    return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)


def _texts(response) -> set[str]:
    return {a["text"] for a in response.get_json()["data"]["announcements"]}


def test_public_list_shows_only_live_announcements(client):
    now = datetime.now(timezone.utc)
    _add("Always on")
    _add("Switched off", active=False)
    _add("Not started", starts_at=now + timedelta(days=1))
    _add("Already ended", ends_at=now - timedelta(minutes=1))
    _add("In its window", starts_at=now - timedelta(days=1), ends_at=now + timedelta(days=1))

    assert _texts(client.get("/api/announcements")) == {"Always on", "In its window"}


def test_public_list_filters_by_placement(client):
    _add("Bar item", placement=AnnouncementPlacement.BAR)
    _add("Notice item", placement=AnnouncementPlacement.NOTICE)

    assert _texts(client.get("/api/announcements?placement=notice")) == {"Notice item"}
    assert client.get("/api/announcements?placement=popup").status_code == 400


def test_admin_list_includes_everything(client, admin_headers, reader_headers):
    _add("Live")
    _add("Switched off", active=False)

    assert client.get("/api/announcements/all").status_code == 401
    assert client.get("/api/announcements/all", headers=reader_headers).status_code == 403
    assert _texts(client.get("/api/announcements/all", headers=admin_headers)) == {"Live", "Switched off"}


def test_admin_creates_an_announcement(client, admin_headers):
    response = client.post(
        "/api/announcements",
        json={
            "text": "  New: SIP calculator  ",
            "link": "/calculators/sip",
            "placement": "banner",
            "starts_at": "2026-11-01T09:00:00+05:30",
            "ends_at": "2026-11-30T18:00:00",
        },
        headers=admin_headers,
    )

    assert response.status_code == 201
    created = response.get_json()["data"]["announcement"]
    assert created["text"] == "New: SIP calculator"
    assert created["placement"] == "banner"
    assert created["active"] is True
    assert _utc(created["starts_at"]) == datetime(2026, 11, 1, 3, 30, tzinfo=timezone.utc)
    assert _utc(created["ends_at"]) == datetime(2026, 11, 30, 18, 0, tzinfo=timezone.utc)  # no offset = UTC


def test_new_announcements_default_to_the_bar(client, admin_headers):
    response = client.post("/api/announcements", json={"text": "Office closed on Diwali"}, headers=admin_headers)

    created = response.get_json()["data"]["announcement"]
    assert (created["placement"], created["link"], created["active"]) == ("announcement_bar", None, True)


@pytest.mark.parametrize(
    "payload, field",
    [
        ({"text": ""}, "text"),
        ({"text": "Hi", "link": "#"}, "link"),
        ({"text": "Hi", "link": "javascript:alert(1)"}, "link"),
        ({"text": "Hi", "placement": "popup"}, "placement"),
        ({"text": "Hi", "starts_at": "2026-11-02T00:00:00Z", "ends_at": "2026-11-01T00:00:00Z"}, "ends_at"),
    ],
)
def test_invalid_announcements_are_rejected(client, admin_headers, payload, field):
    response = client.post("/api/announcements", json=payload, headers=admin_headers)

    assert response.status_code == 422
    assert field in response.get_json()["errors"]
    assert Announcement.query.count() == 0


def test_external_links_are_allowed(client, admin_headers):
    response = client.post(
        "/api/announcements", json={"text": "Check your KYC", "link": "https://www.amfiindia.com"}, headers=admin_headers
    )
    assert response.status_code == 201


def test_admin_updates_an_announcement(client, admin_headers):
    announcement = _add("Live now")

    response = client.patch(f"/api/announcements/{announcement.id}", json={"active": False}, headers=admin_headers)

    assert response.status_code == 200
    assert response.get_json()["data"]["announcement"]["active"] is False
    assert _texts(client.get("/api/announcements")) == set()


def test_update_cannot_end_before_the_start(client, admin_headers):
    starts_at = datetime(2026, 11, 10, tzinfo=timezone.utc)
    announcement = _add("Diwali hours", starts_at=starts_at)

    response = client.patch(
        f"/api/announcements/{announcement.id}", json={"ends_at": "2026-11-09T00:00:00Z"}, headers=admin_headers
    )

    assert response.status_code == 422
    assert db.session.get(Announcement, announcement.id).ends_at is None


def test_admin_deletes_an_announcement(client, admin_headers, reader_headers):
    announcement = _add("Old news")

    assert client.delete(f"/api/announcements/{announcement.id}", headers=reader_headers).status_code == 403
    assert client.delete(f"/api/announcements/{announcement.id}", headers=admin_headers).status_code == 200
    assert client.delete(f"/api/announcements/{announcement.id}", headers=admin_headers).status_code == 404
