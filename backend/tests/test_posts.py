import pytest

from app.services.category_service import create_category
from app.services.post_service import create_post


@pytest.fixture
def posts(admin):
    funds = create_category("Mutual Funds")
    return {
        "blog": create_post(admin, {"title": "What is a SIP?", "content": "...", "status": "published"}),
        "draft": create_post(admin, {"title": "Draft thoughts", "content": "..."}),
        "market": create_post(
            admin,
            {
                "title": "October market update",
                "content": "...",
                "status": "published",
                "post_type": "market_update",
                "category_id": funds.id,
            },
        ),
    }


def _titles(response) -> list[str]:
    return sorted(p["title"] for p in response.get_json()["data"]["posts"])


def test_posts_default_to_blog(posts):
    assert posts["blog"].post_type == "blog"
    assert posts["market"].post_type == "market_update"


def test_admin_creates_a_market_update(client, admin_headers):
    response = client.post(
        "/api/posts",
        json={"title": "November market update", "content": "Markets...", "post_type": "market_update"},
        headers=admin_headers,
    )

    assert response.status_code == 201
    assert response.get_json()["data"]["post"]["post_type"] == "market_update"


def test_invalid_post_type_is_rejected(client, admin_headers):
    response = client.post(
        "/api/posts", json={"title": "Odd post", "content": "...", "post_type": "podcast"}, headers=admin_headers
    )

    assert response.status_code == 422
    assert "post_type" in response.get_json()["errors"]


def test_admin_changes_a_post_type(client, admin_headers, posts):
    response = client.patch(f"/api/posts/{posts['blog'].id}", json={"post_type": "market_update"}, headers=admin_headers)
    assert response.get_json()["data"]["post"]["post_type"] == "market_update"


def test_public_list_filters_by_type(client, posts):
    assert _titles(client.get("/api/posts?type=blog")) == ["What is a SIP?"]
    assert _titles(client.get("/api/posts?type=market_update")) == ["October market update"]
    assert _titles(client.get("/api/posts")) == ["October market update", "What is a SIP?"]
    assert client.get("/api/posts?type=podcast").status_code == 400


def test_type_and_category_filters_combine(client, posts):
    assert _titles(client.get("/api/posts?type=market_update&category=mutual-funds")) == ["October market update"]
    assert _titles(client.get("/api/posts?type=blog&category=mutual-funds")) == []


def test_admin_list_filters_by_type_and_includes_drafts(client, admin_headers, posts):
    blog = client.get("/api/posts/mine?type=blog", headers=admin_headers)
    assert _titles(blog) == ["Draft thoughts", "What is a SIP?"]


def test_public_posts_do_not_expose_the_author_email(client, posts):
    listed = client.get("/api/posts").get_json()["data"]["posts"][0]
    detail = client.get(f"/api/posts/{posts['blog'].slug}").get_json()["data"]["post"]

    assert set(listed["author"]) == {"id", "name"}
    assert set(detail["author"]) == {"id", "name"}


def test_admin_list_filters_by_status_and_search(client, admin_headers, posts):
    assert _titles(client.get("/api/posts/mine?status=draft", headers=admin_headers)) == ["Draft thoughts"]
    assert _titles(client.get("/api/posts/mine?search=sip", headers=admin_headers)) == ["What is a SIP?"]
    assert client.get("/api/posts/mine?status=archived", headers=admin_headers).status_code == 400


def test_admin_fetches_a_draft_by_id(client, admin_headers, posts):
    response = client.get(f"/api/posts/id/{posts['draft'].id}", headers=admin_headers)

    assert response.status_code == 200
    assert response.get_json()["data"]["post"]["content"] == "..."


def test_post_by_id_needs_an_editor(client, reader_headers, posts):
    assert client.get(f"/api/posts/id/{posts['draft'].id}").status_code == 401
    assert client.get(f"/api/posts/id/{posts['draft'].id}", headers=reader_headers).status_code == 403
