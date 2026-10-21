from datetime import datetime, timezone

from app.extensions import db


class SiteSettings(db.Model):
    """A single row holding the editable site details. `data` is validated by SiteSettingsSchema."""

    __tablename__ = "site_settings"

    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON, nullable=False, default=dict)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return "<SiteSettings>"
