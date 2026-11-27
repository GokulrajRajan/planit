import pytest
from flask import request

from app import create_app
from app.config import ProductionConfig, normalize_database_url

SECRET = "shared-proxy-secret"
THROUGH_PROXY = {"X-Planit-Proxy-Secret": SECRET}


def test_health_answers_without_the_database(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json()["data"] == {"status": "ok"}


@pytest.mark.parametrize(
    ("given", "expected"),
    [
        ("postgres://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
        (
            "postgresql://u:p@ep-1.ap-southeast-1.aws.neon.tech/db?sslmode=require&channel_binding=require",
            "postgresql+psycopg://u:p@ep-1.ap-southeast-1.aws.neon.tech/db?sslmode=require&channel_binding=require",
        ),
        ("postgresql+psycopg://u:p@localhost/db", "postgresql+psycopg://u:p@localhost/db"),
        (None, None),
    ],
)
def test_hosted_database_urls_use_psycopg_3(given, expected):
    assert normalize_database_url(given) == expected


def test_production_refuses_to_start_without_its_secrets():
    config = type(
        "IncompleteProduction",
        (ProductionConfig,),
        {
            "SECRET_KEY": "",
            "JWT_SECRET_KEY": "set",
            "SQLALCHEMY_DATABASE_URI": "postgresql+psycopg://u:p@localhost/db",
            "API_PROXY_SECRET": "",
        },
    )

    with pytest.raises(RuntimeError, match="SECRET_KEY, API_PROXY_SECRET"):
        create_app(config)


@pytest.mark.config(API_PROXY_SECRET=SECRET)
@pytest.mark.parametrize("headers", [{}, {"X-Planit-Proxy-Secret": "wrong"}])
def test_with_a_proxy_secret_only_the_proxy_is_answered(client, headers):
    response = client.get("/api/settings", headers=headers)

    assert response.status_code == 403
    assert response.get_json() == {"success": False, "message": "Forbidden", "errors": None}


@pytest.mark.config(API_PROXY_SECRET=SECRET)
def test_requests_through_the_proxy_are_answered(client):
    assert client.get("/api/settings", headers=THROUGH_PROXY).status_code == 200


@pytest.mark.config(API_PROXY_SECRET=SECRET)
def test_health_needs_no_proxy_secret(client):
    assert client.get("/api/health").status_code == 200


@pytest.mark.config(API_PROXY_SECRET=SECRET)
def test_the_visitor_ip_comes_from_the_proxy_header(app, client):
    app.add_url_rule("/api/test/ip", "test_ip", lambda: request.remote_addr or "")

    response = client.get(
        "/api/test/ip",
        headers={**THROUGH_PROXY, "X-Planit-Client-IP": "203.0.113.7", "X-Forwarded-For": "198.51.100.1"},
    )

    assert response.get_data(as_text=True) == "203.0.113.7"


@pytest.mark.config(API_PROXY_SECRET=SECRET)
def test_a_malformed_visitor_ip_is_ignored(app, client):
    app.add_url_rule("/api/test/ip", "test_ip", lambda: request.remote_addr or "")

    response = client.get("/api/test/ip", headers={**THROUGH_PROXY, "X-Planit-Client-IP": "not-an-ip"})

    assert response.get_data(as_text=True) == "127.0.0.1"


@pytest.mark.config(API_PROXY_SECRET=SECRET)
def test_the_proxy_headers_never_reach_the_app(app, client):
    app.add_url_rule(
        "/api/test/headers",
        "test_headers",
        lambda: {name: request.headers.get(name) for name in ("X-Planit-Proxy-Secret", "X-Planit-Client-IP")},
    )

    response = client.get("/api/test/headers", headers={**THROUGH_PROXY, "X-Planit-Client-IP": "203.0.113.7"})

    assert response.get_json() == {"X-Planit-Proxy-Secret": None, "X-Planit-Client-IP": None}
