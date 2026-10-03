from app.extensions import db
from app.models.category import Category
from app.utils.errors import APIError
from app.utils.slugify import unique_slug


def list_categories():
    return Category.query.order_by(Category.name.asc()).all()


def get_category_or_404(category_id: int) -> Category:
    category = db.session.get(Category, category_id)
    if category is None:
        raise APIError("Category not found", status=404)
    return category


def create_category(name: str) -> Category:
    if Category.query.filter(db.func.lower(Category.name) == name.lower()).first():
        raise APIError("A category with this name already exists", status=409)
    category = Category(name=name, slug=unique_slug(name, Category))
    db.session.add(category)
    db.session.commit()
    return category


def update_category(category: Category, name: str) -> Category:
    category.name = name
    category.slug = unique_slug(name, Category, exclude_id=category.id)
    db.session.commit()
    return category


def delete_category(category: Category) -> None:
    db.session.delete(category)
    db.session.commit()
