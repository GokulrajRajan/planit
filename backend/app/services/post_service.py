from datetime import datetime, timezone

from app.extensions import db
from app.models.category import Category
from app.models.post import Post, PostStatus
from app.models.tag import Tag
from app.models.user import User, UserRole
from app.utils.errors import APIError
from app.utils.slugify import unique_slug


def _resolve_tags(tag_names: list[str]) -> list[Tag]:
    tags = []
    for raw_name in tag_names:
        name = raw_name.strip()
        if not name:
            continue
        tag = Tag.query.filter(db.func.lower(Tag.name) == name.lower()).first()
        if tag is None:
            tag = Tag(name=name, slug=unique_slug(name, Tag))
            db.session.add(tag)
            db.session.flush()
        tags.append(tag)
    return tags


def _resolve_category(category_id) -> Category | None:
    if category_id is None:
        return None
    category = db.session.get(Category, category_id)
    if category is None:
        raise APIError("Category not found", status=404)
    return category


def can_manage_post(user: User, post: Post) -> bool:
    return user.is_admin or post.author_id == user.id


def list_published_posts(page: int, per_page: int, category_slug=None, tag_slug=None, search=None):
    query = Post.query.filter_by(status=PostStatus.PUBLISHED)

    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)
    if tag_slug:
        query = query.join(Post.tags).filter(Tag.slug == tag_slug)
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(Post.title.ilike(like), Post.excerpt.ilike(like)))

    query = query.order_by(Post.published_at.desc())
    return query.paginate(page=page, per_page=per_page, error_out=False)


def list_own_posts(user: User, page: int, per_page: int):
    query = Post.query.order_by(Post.created_at.desc())
    if not user.is_admin:
        query = query.filter_by(author_id=user.id)
    return query.paginate(page=page, per_page=per_page, error_out=False)


def get_post_by_slug_or_404(slug: str, viewer: User | None) -> Post:
    post = Post.query.filter_by(slug=slug).first()
    if post is None:
        raise APIError("Post not found", status=404)
    if not post.is_published:
        if viewer is None or not can_manage_post(viewer, post):
            raise APIError("Post not found", status=404)
    return post


def get_post_or_404(post_id: int) -> Post:
    post = db.session.get(Post, post_id)
    if post is None:
        raise APIError("Post not found", status=404)
    return post


def create_post(author: User, data: dict) -> Post:
    title = data["title"]
    status = data.get("status", PostStatus.DRAFT)

    post = Post(
        title=title,
        slug=unique_slug(title, Post),
        excerpt=data.get("excerpt"),
        content=data["content"],
        cover_image_url=data.get("cover_image_url"),
        status=status,
        author=author,
        category=_resolve_category(data.get("category_id")),
        published_at=datetime.now(timezone.utc) if status == PostStatus.PUBLISHED else None,
    )
    post.tags = _resolve_tags(data.get("tag_names", []))

    db.session.add(post)
    db.session.commit()
    return post


def update_post(post: Post, data: dict) -> Post:
    if "title" in data and data["title"] != post.title:
        post.title = data["title"]
        post.slug = unique_slug(data["title"], Post, exclude_id=post.id)
    if "excerpt" in data:
        post.excerpt = data["excerpt"]
    if "content" in data:
        post.content = data["content"]
    if "cover_image_url" in data:
        post.cover_image_url = data["cover_image_url"]
    if "category_id" in data:
        post.category = _resolve_category(data["category_id"])
    if "tag_names" in data:
        post.tags = _resolve_tags(data["tag_names"])
    if "status" in data and data["status"] != post.status:
        post.status = data["status"]
        if post.status == PostStatus.PUBLISHED and post.published_at is None:
            post.published_at = datetime.now(timezone.utc)

    db.session.commit()
    return post


def delete_post(post: Post) -> None:
    db.session.delete(post)
    db.session.commit()
