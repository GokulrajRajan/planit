from datetime import datetime, timedelta, timezone

import pytest

from app.extensions import db
from app.models import testimonial as testimonial_model
from app.models.announcement import Announcement
from app.models.team import TeamMember
from app.schemas.settings_schema import SECTION_KEYS
from app.services.post_service import create_post


def _settings(client) -> dict:
    return client.get("/api/settings").get_json()["data"]["settings"]


def _patch(client, headers, payload):
    return client.patch("/api/settings", json=payload, headers=headers)


def test_defaults_are_empty_placeholders(client):
    settings = _settings(client)

    assert settings["branding"] == {"logo_url": None, "primary_color": None, "accent_color": None}
    assert settings["office"]["phone"] is None
    assert settings["registration"] == {
        "arn": None,
        "arn_valid_from": None,
        "arn_valid_until": None,
        "euin": None,
        "euin_valid_until": None,
        "cin": None,
    }
    assert settings["portal_url"] is None
    assert settings["stats"] == []
    assert settings["sections"] == {key: True for key in SECTION_KEYS}
    # Nothing has been filled in, so only sections that need no data are visible.
    assert {key for key, visible in settings["visible_sections"].items() if visible} == {"newsletter", "faq"}


def test_updating_requires_an_admin(client, reader_headers):
    assert _patch(client, {}, {"portal_url": "https://portal.example.com"}).status_code == 401
    assert _patch(client, reader_headers, {"portal_url": "https://portal.example.com"}).status_code == 403


def test_groups_merge_key_by_key(client, admin_headers):
    _patch(client, admin_headers, {"office": {"phone": "+91 44 1234 5678"}})
    response = _patch(client, admin_headers, {"office": {"city": "Chennai"}})

    assert response.status_code == 200
    office = response.get_json()["data"]["settings"]["office"]
    assert (office["phone"], office["city"]) == ("+91 44 1234 5678", "Chennai")


def test_an_empty_string_clears_a_value(client, admin_headers):
    _patch(client, admin_headers, {"office": {"city": "Chennai"}})
    _patch(client, admin_headers, {"office": {"city": ""}})

    assert _settings(client)["office"]["city"] is None


def test_registration_details_round_trip(client, admin_headers):
    response = _patch(
        client,
        admin_headers,
        {"registration": {"arn": "ARN-123456", "arn_valid_until": "2027-03-31", "euin": "E654321"}},
    )

    settings = response.get_json()["data"]["settings"]
    assert settings["registration"]["arn_valid_until"] == "2027-03-31"
    assert settings["registration"]["euin"] == "E654321"
    assert settings["visible_sections"]["registration_details"] is True


@pytest.mark.parametrize(
    "payload, path",
    [
        ({"branding": {"primary_color": "green"}}, ("branding", "primary_color")),
        ({"branding": {"logo_url": "#"}}, ("branding", "logo_url")),
        ({"registration": {"arn": "123456"}}, ("registration", "arn")),
        ({"registration": {"euin": "X1"}}, ("registration", "euin")),
        ({"registration": {"cin": "ABC"}}, ("registration", "cin")),
        ({"registration": {"arn_valid_until": "31/03/2027"}}, ("registration", "arn_valid_until")),
        ({"office": {"pincode": "6000"}}, ("office", "pincode")),
        ({"office": {"email": "office"}}, ("office", "email")),
        ({"social_links": {"linkedin": "linkedin.com/company/planit"}}, ("social_links", "linkedin")),
        ({"cta": {"start_sip_url": "#"}}, ("cta", "start_sip_url")),
        ({"portal_url": "javascript:alert(1)"}, ("portal_url",)),
        ({"stats": [{"value": "500+"}]}, ("stats",)),
        ({"stats": [{"label": f"Stat {i}", "value": "1"} for i in range(7)]}, ("stats",)),
        ({"sections": {"stats": "maybe"}}, ("sections", "stats")),
        ({"sections": {"popup": True}}, ("sections", "popup")),
        ({"favourite_colour": "teal"}, ("favourite_colour",)),
    ],
)
def test_invalid_settings_are_rejected(client, admin_headers, payload, path):
    response = _patch(client, admin_headers, payload)

    assert response.status_code == 422
    errors = response.get_json()["errors"]
    for key in path:
        assert key in errors
        errors = errors[key]


def test_internal_paths_are_allowed_as_cta_targets(client, admin_headers):
    response = _patch(client, admin_headers, {"cta": {"start_sip_url": "/contact", "open_account_url": "https://x.example"}})
    assert response.status_code == 200


def test_stats_are_replaced_whole_and_can_be_switched_off(client, admin_headers):
    _patch(client, admin_headers, {"stats": [{"label": "Families served", "value": "500+"}, {"label": "Years", "value": "12"}]})
    response = _patch(client, admin_headers, {"stats": [{"label": "Years", "value": "12", "note": "Since 2014"}]})

    settings = response.get_json()["data"]["settings"]
    assert settings["stats"] == [{"label": "Years", "value": "12", "note": "Since 2014"}]
    assert settings["visible_sections"]["stats"] is True

    hidden = _patch(client, admin_headers, {"sections": {"stats": False}}).get_json()["data"]["settings"]
    assert hidden["visible_sections"]["stats"] is False
    assert hidden["sections"]["testimonials"] is True  # other toggles are untouched
    assert hidden["stats"]  # the data is kept


def test_sections_appear_once_their_data_exists(client, admin, admin_headers):
    db.session.add_all(
        [
            TeamMember(name="Hidden Member", visible=False),
            testimonial_model.Testimonial(author_name="Hidden Client", content="Great", visible=False),
            Announcement(text="Expired", ends_at=datetime.now(timezone.utc) - timedelta(days=1)),
        ]
    )
    db.session.commit()
    create_post(admin, {"title": "Draft update", "content": "...", "post_type": "market_update"})

    visible = _settings(client)["visible_sections"]
    assert not any(visible[key] for key in ("team", "testimonials", "announcement_bar", "market_update"))

    db.session.add_all(
        [
            TeamMember(name="Ravi Kumar"),
            testimonial_model.Testimonial(author_name="A Client", content="Helpful and clear"),
            Announcement(text="Live"),
        ]
    )
    db.session.commit()
    create_post(admin, {"title": "Live update", "content": "...", "post_type": "market_update", "status": "published"})
    _patch(
        client,
        admin_headers,
        {
            "grievance_officer": {"name": "S. Iyer", "email": "grievance@example.com"},
            "office": {"map_embed_url": "https://www.google.com/maps/embed?pb=abc"},
            "social_links": {"linkedin": "https://www.linkedin.com/company/planit"},
            "portal_url": "https://portal.example.com",
            "registration": {"arn": "ARN-123456"},
            "stats": [{"label": "Years in practice", "value": "12"}],
        },
    )

    visible = _settings(client)["visible_sections"]
    assert all(visible.values()), visible
