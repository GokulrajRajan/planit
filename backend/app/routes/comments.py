from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.schemas.comment_schema import comment_create_schema, comment_schema, comments_schema
from app.services.auth_service import get_user_or_404
from app.services.comment_service import (
    can_delete_comment,
    create_comment,
    delete_comment,
    get_comment_or_404,
    list_comments_for_post,
)
from app.services.post_service import get_post_or_404
from app.utils.errors import APIError
from app.utils.responses import success

comments_bp = Blueprint("comments", __name__)


@comments_bp.get("/posts/<int:post_id>/comments")
def get_comments(post_id: int):
    post = get_post_or_404(post_id)
    comments = list_comments_for_post(post)
    return success(data={"comments": comments_schema.dump(comments)})


@comments_bp.post("/posts/<int:post_id>/comments")
@jwt_required()
def post_comment(post_id: int):
    post = get_post_or_404(post_id)
    user = get_user_or_404(int(get_jwt_identity()))
    data = comment_create_schema.load(request.get_json(force=True, silent=True) or {})
    comment = create_comment(post, user, data["content"])
    return success(data={"comment": comment_schema.dump(comment)}, message="Comment added successfully", status=201)


@comments_bp.delete("/comments/<int:comment_id>")
@jwt_required()
def remove_comment(comment_id: int):
    user = get_user_or_404(int(get_jwt_identity()))
    comment = get_comment_or_404(comment_id)
    if not can_delete_comment(user, comment):
        raise APIError("You do not have permission to delete this comment", status=403)

    delete_comment(comment)
    return success(message="Comment deleted successfully")
