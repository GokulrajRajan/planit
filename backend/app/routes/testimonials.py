from flask import Blueprint, request

from app.models.user import UserRole
from app.schemas.testimonial_schema import (
    testimonial_create_schema,
    testimonial_schema,
    testimonial_update_schema,
    testimonials_schema,
)
from app.services.testimonial_service import (
    create_testimonial,
    delete_testimonial,
    get_testimonial_or_404,
    list_all_testimonials,
    list_visible_testimonials,
    update_testimonial,
)
from app.utils.decorators import role_required
from app.utils.responses import success

testimonials_bp = Blueprint("testimonials", __name__)


@testimonials_bp.get("")
def get_testimonials():
    return success(data={"testimonials": testimonials_schema.dump(list_visible_testimonials())})


@testimonials_bp.get("/all")
@role_required(UserRole.ADMIN)
def get_all_testimonials():
    return success(data={"testimonials": testimonials_schema.dump(list_all_testimonials())})


@testimonials_bp.post("")
@role_required(UserRole.ADMIN)
def post_testimonial():
    data = testimonial_create_schema.load(request.get_json(force=True, silent=True) or {})
    testimonial = create_testimonial(data)
    return success(
        data={"testimonial": testimonial_schema.dump(testimonial)},
        message="Testimonial added successfully",
        status=201,
    )


@testimonials_bp.patch("/<int:testimonial_id>")
@role_required(UserRole.ADMIN)
def patch_testimonial(testimonial_id: int):
    testimonial = get_testimonial_or_404(testimonial_id)
    data = testimonial_update_schema.load(request.get_json(force=True, silent=True) or {})
    testimonial = update_testimonial(testimonial, data)
    return success(data={"testimonial": testimonial_schema.dump(testimonial)}, message="Testimonial updated successfully")


@testimonials_bp.delete("/<int:testimonial_id>")
@role_required(UserRole.ADMIN)
def remove_testimonial(testimonial_id: int):
    testimonial = get_testimonial_or_404(testimonial_id)
    delete_testimonial(testimonial)
    return success(message="Testimonial removed successfully")
