from app.extensions import db
from app.models.user import User
from app.utils.errors import APIError


def list_users():
    return User.query.order_by(User.created_at.desc()).all()


def get_user_or_404(user_id: int) -> User:
    user = db.session.get(User, user_id)
    if user is None:
        raise APIError("User not found", status=404)
    return user


def update_user(user: User, data: dict, acting_as_admin: bool) -> User:
    if "name" in data:
        user.name = data["name"]
    if "role" in data:
        if not acting_as_admin:
            raise APIError("Only an admin can change a user's role", status=403)
        user.role = data["role"]
    db.session.commit()
    return user


def delete_user(user: User) -> None:
    db.session.delete(user)
    db.session.commit()
