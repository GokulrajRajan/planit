from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.newsletter import NewsletterSubscriber
from app.utils.errors import APIError


def subscribe(email: str) -> NewsletterSubscriber:
    """Adds the address, or refreshes the consent time if it is already subscribed."""
    email = email.lower()
    now = datetime.now(timezone.utc)
    subscriber = NewsletterSubscriber.query.filter_by(email=email).first()
    if subscriber is None:
        subscriber = NewsletterSubscriber(email=email, consented_at=now)
        db.session.add(subscriber)
    else:
        subscriber.consented_at = now
    try:
        db.session.commit()
    except IntegrityError:
        # Two sign-ups for the same address at once: the other request already added it.
        db.session.rollback()
        subscriber = NewsletterSubscriber.query.filter_by(email=email).one()
    return subscriber


def _ordered_query():
    return NewsletterSubscriber.query.order_by(NewsletterSubscriber.created_at.desc(), NewsletterSubscriber.id.desc())


def list_subscribers(page: int, per_page: int):
    return _ordered_query().paginate(page=page, per_page=per_page, error_out=False)


def all_subscribers() -> list[NewsletterSubscriber]:
    return _ordered_query().all()


def get_subscriber_or_404(subscriber_id: int) -> NewsletterSubscriber:
    subscriber = db.session.get(NewsletterSubscriber, subscriber_id)
    if subscriber is None:
        raise APIError("Subscriber not found", status=404)
    return subscriber


def delete_subscriber(subscriber: NewsletterSubscriber) -> None:
    db.session.delete(subscriber)
    db.session.commit()
