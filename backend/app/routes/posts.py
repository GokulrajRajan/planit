from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request

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
from app.utils.responses import success

posts_bp = Blueprint("posts", __name__)


def _pagination_args():
    default_per_page = current_app.config["POSTS_PER_PAGE_DEFAULT"]
    max_per_page = current_app.config["POSTS_PER_PAGE_MAX"]
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", default_per_page, type=int), max_per_page)
    return max(page, 1), max(per_page, 1)


def _paginated_response(pagination, schema):
    return success(
        data={
            "posts": schema.dump(pagination.items),
            "meta": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
            },
        }
    )


def _optional_current_user():
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        return None
    identity = get_jwt_identity()
    return get_user_or_404(int(identity)) if identity else None


@posts_bp.get("")
def get_posts():
    page, per_page = _pagination_args()
    pagination = list_published_posts(
        page=page,
        per_page=per_page,
        category_slug=request.args.get("category"),
        tag_slug=request.args.get("tag"),
        search=request.args.get("search"),
    )
    return _paginated_response(pagination, posts_summary_schema)


@posts_bp.get("/mine")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def get_my_posts():
    user = get_user_or_404(int(get_jwt_identity()))
    page, per_page = _pagination_args()
    pagination = list_own_posts(user, page=page, per_page=per_page)
    return _paginated_response(pagination, posts_summary_schema)


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
