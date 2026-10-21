from flask import Blueprint, request

from app.models.user import UserRole
from app.schemas.team_schema import (
    team_member_create_schema,
    team_member_schema,
    team_member_update_schema,
    team_members_schema,
)
from app.services.team_service import (
    create_team_member,
    delete_team_member,
    get_team_member_or_404,
    list_all_team_members,
    list_visible_team_members,
    update_team_member,
)
from app.utils.decorators import role_required
from app.utils.responses import success

team_bp = Blueprint("team", __name__)


@team_bp.get("")
def get_team():
    return success(data={"team": team_members_schema.dump(list_visible_team_members())})


@team_bp.get("/all")
@role_required(UserRole.ADMIN)
def get_all_team_members():
    return success(data={"team": team_members_schema.dump(list_all_team_members())})


@team_bp.post("")
@role_required(UserRole.ADMIN)
def post_team_member():
    data = team_member_create_schema.load(request.get_json(force=True, silent=True) or {})
    member = create_team_member(data)
    return success(
        data={"team_member": team_member_schema.dump(member)}, message="Team member added successfully", status=201
    )


@team_bp.patch("/<int:member_id>")
@role_required(UserRole.ADMIN)
def patch_team_member(member_id: int):
    member = get_team_member_or_404(member_id)
    data = team_member_update_schema.load(request.get_json(force=True, silent=True) or {})
    member = update_team_member(member, data)
    return success(data={"team_member": team_member_schema.dump(member)}, message="Team member updated successfully")


@team_bp.delete("/<int:member_id>")
@role_required(UserRole.ADMIN)
def remove_team_member(member_id: int):
    member = get_team_member_or_404(member_id)
    delete_team_member(member)
    return success(message="Team member removed successfully")
