from datetime import datetime, timezone

from flask import current_app

from app.extensions import db
from app.models.enquiry import Enquiry
from app.services.mail_service import send_email
from app.utils.errors import APIError

ENQUIRY_FIELDS = ("name", "phone", "email", "city", "service", "message")


class EnquiryStatus:
    NEW = "new"
    HANDLED = "handled"
    ALL = (NEW, HANDLED)


def _notify_office(enquiry: Enquiry) -> bool:
    # Collapse whitespace so a name can't break the Subject header onto a new line.
    name = " ".join(enquiry.name.split())
    body = "\n".join(
        [
            "A new enquiry was submitted on the Planit website.",
            "",
            f"Name: {enquiry.name}",
            f"Phone: {enquiry.phone}",
            f"Email: {enquiry.email}",
            f"City: {enquiry.city or '-'}",
            f"Service: {enquiry.service_label or '-'}",
            "",
            "Message:",
            enquiry.message or "-",
        ]
    )
    return send_email(
        subject=f"New website enquiry from {name}",
        body=body,
        to=current_app.config["ENQUIRY_NOTIFY_TO"],
        reply_to=enquiry.email,
    )


def create_enquiry(data: dict) -> Enquiry:
    enquiry = Enquiry(**{field: data.get(field) for field in ENQUIRY_FIELDS})
    db.session.add(enquiry)
    db.session.commit()

    # The enquiry is already saved, so a mail failure never loses it; notified_at stays empty instead.
    if _notify_office(enquiry):
        enquiry.notified_at = datetime.now(timezone.utc)
        db.session.commit()
    return enquiry


def _filtered_query(status: str | None):
    query = Enquiry.query.order_by(Enquiry.created_at.desc(), Enquiry.id.desc())
    if status == EnquiryStatus.NEW:
        query = query.filter(Enquiry.handled_at.is_(None))
    elif status == EnquiryStatus.HANDLED:
        query = query.filter(Enquiry.handled_at.is_not(None))
    return query


def list_enquiries(page: int, per_page: int, status: str | None = None):
    return _filtered_query(status).paginate(page=page, per_page=per_page, error_out=False)


def all_enquiries(status: str | None = None) -> list[Enquiry]:
    return _filtered_query(status).all()


def get_enquiry_or_404(enquiry_id: int) -> Enquiry:
    enquiry = db.session.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise APIError("Enquiry not found", status=404)
    return enquiry


def set_enquiry_handled(enquiry: Enquiry, handled: bool) -> Enquiry:
    if handled and enquiry.handled_at is None:
        enquiry.handled_at = datetime.now(timezone.utc)
    elif not handled:
        enquiry.handled_at = None
    db.session.commit()
    return enquiry
