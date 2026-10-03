from slugify import slugify as _slugify


def unique_slug(text: str, model, slug_field: str = "slug", exclude_id=None) -> str:
    """Generate a URL-safe slug for `text`, appending -2, -3, ... on collision."""
    base_slug = _slugify(text) or "item"
    slug = base_slug
    counter = 2

    while True:
        query = model.query.filter(getattr(model, slug_field) == slug)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if query.first() is None:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1
