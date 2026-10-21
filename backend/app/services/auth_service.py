from flask_jwt_extended import create_access_token, create_refresh_token

from app.extensions import db
from app.models.user import User, UserRole
from app.utils.errors import APIError


def _claims_for(user: User) -> dict:
    return {"role": user.role, "name": user.name, "email": user.email}


def create_admin(name: str, email: str, password: str) -> User:
    if User.query.filter_by(email=email).first() is not None:
        raise APIError("An account with this email already exists", status=409)

    user = User(name=name, email=email, role=UserRole.ADMIN)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


def authenticate_user(email: str, password: str) -> User:
    """Only admins can sign in. Other accounts get the same error, so the response doesn't reveal roles."""
    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password) or not user.is_admin:
        raise APIError("Invalid email or password", status=401)
    return user


def get_admin_or_401(user_id: int) -> User:
    """Used on token refresh, so a deleted or demoted account can't keep its session alive."""
    user = db.session.get(User, user_id)
    if user is None or not user.is_admin:
        raise APIError("Authentication required", status=401)
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    access_token = create_access_token(identity=str(user.id), additional_claims=_claims_for(user))
    refresh_token = create_refresh_token(identity=str(user.id))
    return access_token, refresh_token


def get_user_or_404(user_id: int) -> User:
    user = db.session.get(User, user_id)
    if user is None:
        raise APIError("User not found", status=404)
    return user
