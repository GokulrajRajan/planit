from datetime import datetime, timezone

from app.extensions import db

# Services a visitor can pick on the enquiry form, mapped to the label shown in emails and exports.
ENQUIRY_SERVICES = {
    "mutual_funds": "Mutual Funds",
    "sip_planning": "SIP Planning",
    "goal_planning": "Goal Planning",
    "retirement_planning": "Retirement Planning",
    "tax_saving": "Tax Saving Investments",
    "insurance_review": "Insurance Review",
    "other": "Other",
}


class Enquiry(db.Model):
    __tablename__ = "enquiries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(80), nullable=True)
    service = db.Column(db.String(40), nullable=True)
    message = db.Column(db.Text, nullable=True)

    handled_at = db.Column(db.DateTime(timezone=True), nullable=True)
    # Set once the notification email to the office has been sent.
    notified_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    @property
    def handled(self) -> bool:
        return self.handled_at is not None

    @property
    def service_label(self) -> str | None:
        return ENQUIRY_SERVICES.get(self.service) if self.service else None

    def __repr__(self) -> str:
        return f"<Enquiry {self.id} from {self.email}>"
