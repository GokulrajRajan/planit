from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models.post import PostStatus, PostType
from app.models.user import UserRole
from app.schemas.post_schema import (
    post_create_schema,
    post_schema,
    post_update_schema,
    posts_summary_schema,
)
from app.services.auth_service import get_user_or_404
from app.services.post_service import (
    can_manage_post,
    create_post,
    delete_post,
    get_post_by_slug_or_404,
    get_post_or_404,
    list_own_posts,
    list_published_posts,
    update_post,
)
from app.utils.decorators import role_required
from app.utils.errors import APIError
from app.utils.pagination import paginated_data, pagination_args
from app.utils.request_args import choice_arg
from app.utils.responses import success

posts_bp = Blueprint("posts", __name__)


def _optional_current_user():
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        return None
    identity = get_jwt_identity()
    return get_user_or_404(int(identity)) if identity else None


@posts_bp.get("")
def get_posts():
    page, per_page = pagination_args()
    pagination = list_published_posts(
        page=page,
        per_page=per_page,
        category_slug=request.args.get("category"),
        tag_slug=request.args.get("tag"),
        search=request.args.get("search"),
        post_type=choice_arg("type", PostType.ALL),
    )
    return success(data=paginated_data(pagination, posts_summary_schema, "posts"))


@posts_bp.get("/mine")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def get_my_posts():
    user = get_user_or_404(int(get_jwt_identity()))
    page, per_page = pagination_args()
    pagination = list_own_posts(
        user,
        page=page,
        per_page=per_page,
        post_type=choice_arg("type", PostType.ALL),
        status=choice_arg("status", PostStatus.ALL),
        search=request.args.get("search"),
    )
    return success(data=paginated_data(pagination, posts_summary_schema, "posts"))


@posts_bp.get("/id/<int:post_id>")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def get_post_by_id(post_id: int):
    """For the admin editor: looks a post up by id, since its slug changes when the title does."""
    user = get_user_or_404(int(get_jwt_identity()))
    post = get_post_or_404(post_id)
    if not can_manage_post(user, post):
        raise APIError("Post not found", status=404)
    return success(data={"post": post_schema.dump(post)})


@posts_bp.get("/<string:slug>")
def get_post(slug: str):
    viewer = _optional_current_user()
    post = get_post_by_slug_or_404(slug, viewer)
    return success(data={"post": post_schema.dump(post)})


@posts_bp.post("")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def post_post():
    author = get_user_or_404(int(get_jwt_identity()))
    data = post_create_schema.load(request.get_json(force=True, silent=True) or {})
    post = create_post(author, data)
    return success(data={"post": post_schema.dump(post)}, message="Post created successfully", status=201)


@posts_bp.patch("/<int:post_id>")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def patch_post(post_id: int):
    user = get_user_or_404(int(get_jwt_identity()))
    post = get_post_or_404(post_id)
    if not can_manage_post(user, post):
        raise APIError("You do not have permission to edit this post", status=403)

    data = post_update_schema.load(request.get_json(force=True, silent=True) or {})
    post = update_post(post, data)
    return success(data={"post": post_schema.dump(post)}, message="Post updated successfully")


@posts_bp.delete("/<int:post_id>")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def remove_post(post_id: int):
    user = get_user_or_404(int(get_jwt_identity()))
    post = get_post_or_404(post_id)
    if not can_manage_post(user, post):
        raise APIError("You do not have permission to delete this post", status=403)

    delete_post(post)
    return success(message="Post deleted successfully")
