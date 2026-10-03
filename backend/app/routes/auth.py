from flask import Blueprint, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from app.schemas.auth_schema import LoginSchema, RegisterSchema
from app.schemas.user_schema import user_schema
from app.services.auth_service import authenticate_user, get_user_or_404, issue_tokens, register_user
from app.utils.responses import success

auth_bp = Blueprint("auth", __name__)

register_schema = RegisterSchema()
login_schema = LoginSchema()


@auth_bp.post("/register")
def register():
    data = register_schema.load(request.get_json(force=True, silent=True) or {})
    user = register_user(data["name"], data["email"], data["password"])
    access_token, refresh_token = issue_tokens(user)

    response, status = success(
        data={"user": user_schema.dump(user), "access_token": access_token},
        message="Account created successfully",
        status=201,
    )
    set_refresh_cookies(response, refresh_token)
    return response, status


@auth_bp.post("/login")
def login():
    data = login_schema.load(request.get_json(force=True, silent=True) or {})
    user = authenticate_user(data["email"], data["password"])
    access_token, refresh_token = issue_tokens(user)

    response, status = success(
        data={"user": user_schema.dump(user), "access_token": access_token},
        message="Login successful",
    )
    set_refresh_cookies(response, refresh_token)
    return response, status


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user = get_user_or_404(int(get_jwt_identity()))
    access_token, refresh_token = issue_tokens(user)

    response, status = success(data={"access_token": access_token}, message="Token refreshed")
    set_refresh_cookies(response, refresh_token)
    return response, status


@auth_bp.post("/logout")
@jwt_required()
def logout():
    response, status = success(message="Logged out successfully")
    unset_jwt_cookies(response)
    return response, status


@auth_bp.get("/me")
@jwt_required()
def me():
    user = get_user_or_404(int(get_jwt_identity()))
    return success(data={"user": user_schema.dump(user)})
