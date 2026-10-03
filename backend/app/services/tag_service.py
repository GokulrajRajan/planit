from app.extensions import db
from app.models.tag import Tag
from app.utils.errors import APIError
from app.utils.slugify import unique_slug


def list_tags():
    return Tag.query.order_by(Tag.name.asc()).all()


def get_tag_or_404(tag_id: int) -> Tag:
    tag = db.session.get(Tag, tag_id)
    if tag is None:
        raise APIError("Tag not found", status=404)
    return tag


def update_tag(tag: Tag, name: str) -> Tag:
    tag.name = name
    tag.slug = unique_slug(name, Tag, exclude_id=tag.id)
    db.session.commit()
    return tag


def delete_tag(tag: Tag) -> None:
    db.session.delete(tag)
    db.session.commit()
