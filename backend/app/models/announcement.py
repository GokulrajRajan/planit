from datetime import datetime, timezone

from app.extensions import db


class AnnouncementPlacement:
    BAR = "announcement_bar"
    BANNER = "banner"
    NOTICE = "notice"
    ALL = (BAR, BANNER, NOTICE)


class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(300), nullable=False)
    link = db.Column(db.String(500), nullable=True)
    placement = db.Column(db.String(30), nullable=False, default=AnnouncementPlacement.BAR, index=True)
    # Optional display window; an empty bound means "no limit" on that side.
    starts_at = db.Column(db.DateTime(timezone=True), nullable=True)
    ends_at = db.Column(db.DateTime(timezone=True), nullable=True)
    active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Announcement {self.id} ({self.placement})>"
