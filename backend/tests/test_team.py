import pytest

from app.extensions import db
from app.models.team import TeamMember


def _add(name, **fields) -> TeamMember:
    member = TeamMember(name=name, **fields)
    db.session.add(member)
    db.session.commit()
    return member


def _names(response) -> list[str]:
    return [m["name"] for m in response.get_json()["data"]["team"]]


def test_public_list_shows_visible_members_in_order(client):
    _add("Second", sort_order=2)
    _add("Hidden", visible=False)
    _add("First", sort_order=1)

    assert _names(client.get("/api/team")) == ["First", "Second"]


def test_admin_list_includes_hidden_members(client, admin_headers, reader_headers):
    _add("Shown")
    _add("Hidden", visible=False)

    assert client.get("/api/team/all").status_code == 401
    assert client.get("/api/team/all", headers=reader_headers).status_code == 403
    assert _names(client.get("/api/team/all", headers=admin_headers)) == ["Shown", "Hidden"]


def test_admin_adds_a_member(client, admin_headers):
    response = client.post(
        "/api/team",
        json={
            "name": "Meena Krishnan",
            "designation": "Founder",
            "qualifications": "NISM Series V-A",
            "photo_url": "/team/meena.jpg",
            "linkedin_url": "https://www.linkedin.com/in/meena",
        },
        headers=admin_headers,
    )

    assert response.status_code == 201
    member = response.get_json()["data"]["team_member"]
    assert (member["name"], member["visible"], member["sort_order"]) == ("Meena Krishnan", True, 0)


@pytest.mark.parametrize(
    "payload, field",
    [
        ({}, "name"),
        ({"name": "A"}, "name"),
        ({"name": "Meena", "linkedin_url": "not a url"}, "linkedin_url"),
        ({"name": "Meena", "photo_url": "#"}, "photo_url"),
    ],
)
def test_invalid_members_are_rejected(client, admin_headers, payload, field):
    response = client.post("/api/team", json=payload, headers=admin_headers)

    assert response.status_code == 422
    assert field in response.get_json()["errors"]


def test_admin_hides_a_member(client, admin_headers):
    member = _add("Meena")

    response = client.patch(f"/api/team/{member.id}", json={"visible": False}, headers=admin_headers)

    assert response.status_code == 200
    assert response.get_json()["data"]["team_member"]["visible"] is False
    assert _names(client.get("/api/team")) == []


def test_admin_removes_a_member(client, admin_headers, reader_headers):
    member = _add("Meena")

    assert client.delete(f"/api/team/{member.id}", headers=reader_headers).status_code == 403
    assert client.delete(f"/api/team/{member.id}", headers=admin_headers).status_code == 200
    assert client.patch(f"/api/team/{member.id}", json={"visible": True}, headers=admin_headers).status_code == 404
