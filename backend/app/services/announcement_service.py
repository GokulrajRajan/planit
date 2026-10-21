from datetime import datetime, timezone

from app.extensions import db
from app.models.announcement import Announcement
from app.utils.errors import APIError

ANNOUNCEMENT_FIELDS = ("text", "link", "placement", "starts_at", "ends_at", "active")


def _as_utc(value: datetime | None) -> datetime | None:
    # Databases without time zone support hand back naive values, which are stored as UTC.
    if value is None:
        return None
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def _check_window(announcement: Announcement) -> None:
    starts_at, ends_at = _as_utc(announcement.starts_at), _as_utc(announcement.ends_at)
    if starts_at and ends_at and ends_at <= starts_at:
        raise APIError(
            "Validation failed", status=422, errors={"ends_at": ["The end time must be after the start time."]}
        )


def _apply(announcement: Announcement, data: dict) -> None:
    for field in ANNOUNCEMENT_FIELDS:
        if field in data:
            value = data[field]
            setattr(announcement, field, _as_utc(value) if field in ("starts_at", "ends_at") else value)
    _check_window(announcement)


def active_announcements_query(placement: str | None = None):
    now = datetime.now(timezone.utc)
    query = Announcement.query.filter(
        Announcement.active.is_(True),
        db.or_(Announcement.starts_at.is_(None), Announcement.starts_at <= now),
        db.or_(Announcement.ends_at.is_(None), Announcement.ends_at > now),
    )
    if placement:
        query = query.filter(Announcement.placement == placement)
    return query


def list_active_announcements(placement: str | None = None) -> list[Announcement]:
    query = active_announcements_query(placement)
    return query.order_by(Announcement.created_at.desc(), Announcement.id.desc()).all()


def list_all_announcements() -> list[Announcement]:
    return Announcement.query.order_by(Announcement.created_at.desc(), Announcement.id.desc()).all()


def get_announcement_or_404(announcement_id: int) -> Announcement:
    announcement = db.session.get(Announcement, announcement_id)
    if announcement is None:
        raise APIError("Announcement not found", status=404)
    return announcement


def create_announcement(data: dict) -> Announcement:
    announcement = Announcement()
    _apply(announcement, data)
    db.session.add(announcement)
    db.session.commit()
    return announcement


def update_announcement(announcement: Announcement, data: dict) -> Announcement:
    try:
        _apply(announcement, data)
    except APIError:
        db.session.rollback()
        raise
    db.session.commit()
    return announcement


def delete_announcement(announcement: Announcement) -> None:
    db.session.delete(announcement)
    db.session.commit()
