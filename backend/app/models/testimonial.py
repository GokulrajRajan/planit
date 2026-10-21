from datetime import datetime, timezone

from app.extensions import db


class Testimonial(db.Model):
    __tablename__ = "testimonials"

    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String(120), nullable=False)
    # Short context shown under the name, e.g. "Salaried professional, Chennai".
    author_detail = db.Column(db.String(120), nullable=True)
    content = db.Column(db.Text, nullable=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    visible = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self) -> str:
        return f"<Testimonial {self.id} by {self.author_name}>"
