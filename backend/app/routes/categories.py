from flask import Blueprint, request

from app.models.user import UserRole
from app.schemas.category_schema import category_schema, category_write_schema, categories_schema
from app.services.category_service import (
    create_category,
    delete_category,
    get_category_or_404,
    list_categories,
    update_category,
)
from app.utils.decorators import role_required
from app.utils.responses import success

categories_bp = Blueprint("categories", __name__)


@categories_bp.get("")
def get_categories():
    categories = list_categories()
    return success(data={"categories": categories_schema.dump(categories)})


@categories_bp.post("")
@role_required(UserRole.ADMIN)
def post_category():
    data = category_write_schema.load(request.get_json(force=True, silent=True) or {})
    category = create_category(data["name"])
    return success(
        data={"category": category_schema.dump(category)}, message="Category created successfully", status=201
    )


@categories_bp.patch("/<int:category_id>")
@role_required(UserRole.ADMIN)
def patch_category(category_id: int):
    category = get_category_or_404(category_id)
    data = category_write_schema.load(request.get_json(force=True, silent=True) or {})
    category = update_category(category, data["name"])
    return success(data={"category": category_schema.dump(category)}, message="Category updated successfully")


@categories_bp.delete("/<int:category_id>")
@role_required(UserRole.ADMIN)
def remove_category(category_id: int):
    category = get_category_or_404(category_id)
    delete_category(category)
    return success(message="Category deleted successfully")
