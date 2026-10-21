from marshmallow import Schema, fields, validate

from app.schemas.base import REQUIRED, TrimmedSchema


class NewsletterSubscriberSchema(Schema):
    id = fields.Integer(dump_only=True)
    email = fields.String(dump_only=True)
    consented_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class NewsletterSubscribeSchema(TrimmedSchema):
    email = fields.Email(required=True, validate=validate.Length(max=255), error_messages=REQUIRED)
    consent = fields.Boolean(
        required=True,
        validate=validate.Equal(True, error="Please agree to receive emails from Planit."),
        error_messages={"required": "Please agree to receive emails from Planit."},
    )
    captcha = fields.String(allow_none=True, load_only=True)


newsletter_subscriber_schema = NewsletterSubscriberSchema()
newsletter_subscribers_schema = NewsletterSubscriberSchema(many=True)
newsletter_subscribe_schema = NewsletterSubscribeSchema()
