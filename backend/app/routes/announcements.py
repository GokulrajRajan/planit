from flask import Blueprint, request

from app.models.announcement import AnnouncementPlacement
from app.models.user import UserRole
from app.schemas.announcement_schema import (
    announcement_create_schema,
    announcement_schema,
    announcement_update_schema,
    announcements_schema,
)
from app.services.announcement_service import (
    create_announcement,
    delete_announcement,
    get_announcement_or_404,
    list_active_announcements,
    list_all_announcements,
    update_announcement,
)
from app.utils.decorators import role_required
from app.utils.request_args import choice_arg
from app.utils.responses import success

announcements_bp = Blueprint("announcements", __name__)


@announcements_bp.get("")
def get_announcements():
    announcements = list_active_announcements(placement=choice_arg("placement", AnnouncementPlacement.ALL))
    return success(data={"announcements": announcements_schema.dump(announcements)})


@announcements_bp.get("/all")
@role_required(UserRole.ADMIN)
def get_all_announcements():
    return success(data={"announcements": announcements_schema.dump(list_all_announcements())})


@announcements_bp.post("")
@role_required(UserRole.ADMIN)
def post_announcement():
    data = announcement_create_schema.load(request.get_json(force=True, silent=True) or {})
    announcement = create_announcement(data)
    return success(
        data={"announcement": announcement_schema.dump(announcement)},
        message="Announcement created successfully",
        status=201,
    )


@announcements_bp.patch("/<int:announcement_id>")
@role_required(UserRole.ADMIN)
def patch_announcement(announcement_id: int):
    announcement = get_announcement_or_404(announcement_id)
    data = announcement_update_schema.load(request.get_json(force=True, silent=True) or {})
    announcement = update_announcement(announcement, data)
    return success(
        data={"announcement": announcement_schema.dump(announcement)}, message="Announcement updated successfully"
    )


@announcements_bp.delete("/<int:announcement_id>")
@role_required(UserRole.ADMIN)
def remove_announcement(announcement_id: int):
    announcement = get_announcement_or_404(announcement_id)
    delete_announcement(announcement)
    return success(message="Announcement deleted successfully")
