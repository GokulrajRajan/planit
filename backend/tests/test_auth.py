import pytest

from app.extensions import db
from app.models.user import User, UserRole
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD, READER_EMAIL, READER_PASSWORD


def _login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_admin_can_log_in(client, admin):
    response = _login(client, ADMIN_EMAIL, ADMIN_PASSWORD)

    assert response.status_code == 200
    body = response.get_json()
    assert body["data"]["user"]["role"] == UserRole.ADMIN
    assert body["data"]["access_token"]
    assert "refresh_token_cookie=" in response.headers.get("Set-Cookie", "")


def test_non_admin_cannot_log_in(client, reader):
    response = _login(client, READER_EMAIL, READER_PASSWORD)

    assert response.status_code == 401
    # Same message as a wrong password, so the response doesn't reveal that the account exists.
    assert response.get_json()["message"] == "Invalid email or password"


def test_wrong_password_is_rejected(client, admin):
    response = _login(client, ADMIN_EMAIL, "not-the-password")
    assert response.status_code == 401


def test_public_registration_is_gone(client):
    response = client.post(
        "/api/auth/register", json={"name": "New Person", "email": "new@example.com", "password": "password123"}
    )
    assert response.status_code == 404
    assert User.query.count() == 0


def test_refresh_works_for_admin_and_stops_after_demotion(client, admin):
    _login(client, ADMIN_EMAIL, ADMIN_PASSWORD)

    assert client.post("/api/auth/refresh").status_code == 200

    admin.role = UserRole.READER
    db.session.commit()
    assert client.post("/api/auth/refresh").status_code == 401


@pytest.mark.config(RATELIMIT_ENABLED=True, LOGIN_RATE_LIMIT="2 per minute")
def test_login_is_rate_limited(client, admin):
    for _ in range(2):
        assert _login(client, ADMIN_EMAIL, "wrong-password").status_code == 401

    response = _login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    assert response.status_code == 429
    assert response.get_json()["success"] is False


def test_create_admin_command(app):
    result = app.test_cli_runner().invoke(
        args=["create-admin", "--name", "Office Admin", "--email", "office@example.com", "--password", "long-enough-pw"]
    )

    assert result.exit_code == 0, result.output
    assert "Admin created: office@example.com" in result.output
    user = User.query.filter_by(email="office@example.com").one()
    assert user.is_admin
    assert user.check_password("long-enough-pw")


@pytest.mark.parametrize(
    "args, message",
    [
        (["--email", "not-an-email", "--password", "long-enough-pw"], "email:"),
        (["--email", "office@example.com", "--password", "short"], "password:"),
    ],
)
def test_create_admin_command_validates_input(app, args, message):
    result = app.test_cli_runner().invoke(args=["create-admin", "--name", "Office Admin", *args])

    assert result.exit_code != 0
    assert message in result.output
    assert User.query.count() == 0


def test_create_admin_command_rejects_duplicate_email(app, admin):
    result = app.test_cli_runner().invoke(
        args=["create-admin", "--name", "Someone", "--email", ADMIN_EMAIL, "--password", "long-enough-pw"]
    )

    assert result.exit_code != 0
    assert "already exists" in result.output
