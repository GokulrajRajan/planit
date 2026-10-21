from flask import Blueprint, current_app, request

from app.extensions import limiter
from app.models.user import UserRole
from app.schemas.enquiry_schema import (
    enquiries_schema,
    enquiry_create_schema,
    enquiry_schema,
    enquiry_update_schema,
)
from app.services.captcha_service import verify_captcha
from app.services.enquiry_service import (
    EnquiryStatus,
    all_enquiries,
    create_enquiry,
    get_enquiry_or_404,
    list_enquiries,
    set_enquiry_handled,
)
from app.utils.csv_export import csv_response
from app.utils.decorators import role_required
from app.utils.pagination import paginated_data, pagination_args
from app.utils.request_args import choice_arg
from app.utils.responses import success

enquiries_bp = Blueprint("enquiries", __name__)


@enquiries_bp.post("")
@limiter.limit(lambda: current_app.config["ENQUIRY_RATE_LIMIT"])
def post_enquiry():
    data = enquiry_create_schema.load(request.get_json(force=True, silent=True) or {})
    verify_captcha(data.pop("captcha", None), request.remote_addr)
    create_enquiry(data)
    return success(message="Thank you. We'll get back to you shortly.", status=201)


@enquiries_bp.get("")
@role_required(UserRole.ADMIN)
def get_enquiries():
    page, per_page = pagination_args()
    pagination = list_enquiries(page=page, per_page=per_page, status=choice_arg("status", EnquiryStatus.ALL))
    return success(data=paginated_data(pagination, enquiries_schema, "enquiries"))


@enquiries_bp.get("/export")
@role_required(UserRole.ADMIN)
def export_enquiries():
    enquiries = all_enquiries(status=choice_arg("status", EnquiryStatus.ALL))
    return csv_response(
        "enquiries",
        ["Received", "Name", "Phone", "Email", "City", "Service", "Message", "Handled"],
        (
            [e.created_at, e.name, e.phone, e.email, e.city, e.service_label, e.message, e.handled_at]
            for e in enquiries
        ),
    )


@enquiries_bp.patch("/<int:enquiry_id>")
@role_required(UserRole.ADMIN)
def patch_enquiry(enquiry_id: int):
    enquiry = get_enquiry_or_404(enquiry_id)
    data = enquiry_update_schema.load(request.get_json(force=True, silent=True) or {})
    enquiry = set_enquiry_handled(enquiry, data["handled"])
    return success(data={"enquiry": enquiry_schema.dump(enquiry)}, message="Enquiry updated successfully")
