import os

import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db
from app.models.user import User, UserRole
from app.services.auth_service import create_admin, issue_tokens

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "correct-horse-battery"
READER_EMAIL = "reader@example.com"
READER_PASSWORD = "reader-password"


@pytest.fixture
def app(request):
    uri = TestingConfig.SQLALCHEMY_DATABASE_URI
    if not uri:
        pytest.exit("Set TEST_DATABASE_URL to a separate database: the tests drop every table.")
    if uri == os.environ.get("DATABASE_URL"):
        pytest.exit("TEST_DATABASE_URL must not be the development database: the tests drop every table.")

    # @pytest.mark.config(NAME=value) overrides config values for one test.
    marker = request.node.get_closest_marker("config")
    config = type("TestConfig", (TestingConfig,), marker.kwargs if marker else {})

    app = create_app(config)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin(app):
    return create_admin("Asha Admin", ADMIN_EMAIL, ADMIN_PASSWORD)


@pytest.fixture
def reader(app):
    """An account that isn't an admin (e.g. left over from before sign-up was removed)."""
    user = User(name="Rita Reader", email=READER_EMAIL, role=UserRole.READER)
    user.set_password(READER_PASSWORD)
    db.session.add(user)
    db.session.commit()
    return user


def _bearer(user) -> dict:
    access_token, _ = issue_tokens(user)
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_headers(admin):
    return _bearer(admin)


@pytest.fixture
def reader_headers(reader):
    return _bearer(reader)
