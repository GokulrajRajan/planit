from flask import Blueprint, request

from app.models.user import UserRole
from app.schemas.tag_schema import tag_schema, tag_write_schema, tags_schema
from app.services.tag_service import delete_tag, get_tag_or_404, list_tags, update_tag
from app.utils.decorators import role_required
from app.utils.responses import success

tags_bp = Blueprint("tags", __name__)


@tags_bp.get("")
def get_tags():
    tags = list_tags()
    return success(data={"tags": tags_schema.dump(tags)})


@tags_bp.patch("/<int:tag_id>")
@role_required(UserRole.ADMIN)
def patch_tag(tag_id: int):
    tag = get_tag_or_404(tag_id)
    data = tag_write_schema.load(request.get_json(force=True, silent=True) or {})
    tag = update_tag(tag, data["name"])
    return success(data={"tag": tag_schema.dump(tag)}, message="Tag updated successfully")


@tags_bp.delete("/<int:tag_id>")
@role_required(UserRole.ADMIN)
def remove_tag(tag_id: int):
    tag = get_tag_or_404(tag_id)
    delete_tag(tag)
    return success(message="Tag deleted successfully")
