from flask import Blueprint, current_app, request

from app.extensions import limiter
from app.models.user import UserRole
from app.schemas.newsletter_schema import newsletter_subscribe_schema, newsletter_subscribers_schema
from app.services.captcha_service import verify_captcha
from app.services.newsletter_service import (
    all_subscribers,
    delete_subscriber,
    get_subscriber_or_404,
    list_subscribers,
    subscribe,
)
from app.utils.csv_export import csv_response
from app.utils.decorators import role_required
from app.utils.pagination import paginated_data, pagination_args
from app.utils.responses import success

newsletter_bp = Blueprint("newsletter", __name__)


@newsletter_bp.post("")
@limiter.limit(lambda: current_app.config["NEWSLETTER_RATE_LIMIT"])
def post_subscription():
    data = newsletter_subscribe_schema.load(request.get_json(force=True, silent=True) or {})
    verify_captcha(data.get("captcha"), request.remote_addr)
    subscribe(data["email"])
    # Same reply for new and existing addresses, so the form can't be used to look up subscribers.
    return success(message="Thanks for subscribing to the Planit newsletter.", status=201)


@newsletter_bp.get("")
@role_required(UserRole.ADMIN)
def get_subscribers():
    page, per_page = pagination_args()
    pagination = list_subscribers(page=page, per_page=per_page)
    return success(data=paginated_data(pagination, newsletter_subscribers_schema, "subscribers"))


@newsletter_bp.get("/export")
@role_required(UserRole.ADMIN)
def export_subscribers():
    return csv_response(
        "newsletter-subscribers",
        ["Email", "Consented at", "Subscribed at"],
        ([s.email, s.consented_at, s.created_at] for s in all_subscribers()),
    )


@newsletter_bp.delete("/<int:subscriber_id>")
@role_required(UserRole.ADMIN)
def remove_subscriber(subscriber_id: int):
    subscriber = get_subscriber_or_404(subscriber_id)
    delete_subscriber(subscriber)
    return success(message="Subscriber removed successfully")
