from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from app.models.user import UserRole
from app.schemas.user_schema import user_schema, user_update_schema, users_schema
from app.services.user_service import delete_user, get_user_or_404, list_users, update_user
from app.utils.decorators import role_required
from app.utils.errors import APIError
from app.utils.responses import success

users_bp = Blueprint("users", __name__)


@users_bp.get("")
@role_required(UserRole.ADMIN)
def get_users():
    users = list_users()
    return success(data={"users": users_schema.dump(users)})


@users_bp.get("/<int:user_id>")
@jwt_required()
def get_user(user_id: int):
    claims = get_jwt()
    current_user_id = int(get_jwt_identity())
    if claims.get("role") != UserRole.ADMIN and current_user_id != user_id:
        raise APIError("You do not have permission to view this user", status=403)

    user = get_user_or_404(user_id)
    return success(data={"user": user_schema.dump(user)})


@users_bp.patch("/<int:user_id>")
@jwt_required()
def patch_user(user_id: int):
    claims = get_jwt()
    is_admin = claims.get("role") == UserRole.ADMIN
    current_user_id = int(get_jwt_identity())
    if not is_admin and current_user_id != user_id:
        raise APIError("You do not have permission to update this user", status=403)

    user = get_user_or_404(user_id)
    data = user_update_schema.load(request.get_json(force=True, silent=True) or {})
    user = update_user(user, data, acting_as_admin=is_admin)
    return success(data={"user": user_schema.dump(user)}, message="User updated successfully")


@users_bp.delete("/<int:user_id>")
@role_required(UserRole.ADMIN)
def remove_user(user_id: int):
    user = get_user_or_404(user_id)
    delete_user(user)
    return success(message="User deleted successfully")
