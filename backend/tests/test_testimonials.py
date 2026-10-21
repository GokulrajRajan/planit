import pytest

from app.extensions import db
from app.models import testimonial as testimonial_model  # a bare `Testimonial` name looks like a test class to pytest


def _add(author_name, **fields):
    testimonial = testimonial_model.Testimonial(
        author_name=author_name, content=fields.pop("content", "Very helpful."), **fields
    )
    db.session.add(testimonial)
    db.session.commit()
    return testimonial


def _authors(response) -> list[str]:
    return [t["author_name"] for t in response.get_json()["data"]["testimonials"]]


def test_public_list_shows_visible_testimonials_in_order(client):
    _add("Later", sort_order=5)
    _add("Hidden", visible=False)
    _add("Sooner", sort_order=1)

    assert _authors(client.get("/api/testimonials")) == ["Sooner", "Later"]


def test_admin_list_includes_hidden_testimonials(client, admin_headers, reader_headers):
    _add("Shown")
    _add("Hidden", visible=False)

    assert client.get("/api/testimonials/all").status_code == 401
    assert client.get("/api/testimonials/all", headers=reader_headers).status_code == 403
    assert _authors(client.get("/api/testimonials/all", headers=admin_headers)) == ["Shown", "Hidden"]


def test_admin_adds_a_testimonial(client, admin_headers):
    response = client.post(
        "/api/testimonials",
        json={"author_name": "R. Sharma", "author_detail": "Doctor, Chennai", "content": "Clear advice."},
        headers=admin_headers,
    )

    assert response.status_code == 201
    created = response.get_json()["data"]["testimonial"]
    assert (created["author_detail"], created["visible"]) == ("Doctor, Chennai", True)


@pytest.mark.parametrize(
    "payload, field",
    [
        ({"content": "Nice"}, "author_name"),
        ({"author_name": "R. Sharma"}, "content"),
        ({"author_name": "R. Sharma", "content": "x" * 1001}, "content"),
    ],
)
def test_invalid_testimonials_are_rejected(client, admin_headers, payload, field):
    response = client.post("/api/testimonials", json=payload, headers=admin_headers)

    assert response.status_code == 422
    assert field in response.get_json()["errors"]


def test_admin_hides_a_testimonial(client, admin_headers):
    testimonial = _add("R. Sharma")

    response = client.patch(f"/api/testimonials/{testimonial.id}", json={"visible": False}, headers=admin_headers)

    assert response.status_code == 200
    assert _authors(client.get("/api/testimonials")) == []


def test_admin_removes_a_testimonial(client, admin_headers, reader_headers):
    testimonial = _add("R. Sharma")

    assert client.delete(f"/api/testimonials/{testimonial.id}", headers=reader_headers).status_code == 403
    assert client.delete(f"/api/testimonials/{testimonial.id}", headers=admin_headers).status_code == 200
    assert client.delete(f"/api/testimonials/{testimonial.id}", headers=admin_headers).status_code == 404
