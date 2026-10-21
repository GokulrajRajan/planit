from marshmallow import Schema, fields, validate

from app.models.enquiry import ENQUIRY_SERVICES
from app.schemas.base import REQUIRED, TrimmedSchema
from app.utils.validators import validate_phone


class EnquirySchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(dump_only=True)
    phone = fields.String(dump_only=True)
    email = fields.String(dump_only=True)
    city = fields.String(dump_only=True, allow_none=True)
    service = fields.String(dump_only=True, allow_none=True)
    service_label = fields.String(dump_only=True, allow_none=True)
    message = fields.String(dump_only=True, allow_none=True)
    handled = fields.Boolean(dump_only=True)
    handled_at = fields.DateTime(dump_only=True, allow_none=True)
    notified_at = fields.DateTime(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)


class EnquiryCreateSchema(TrimmedSchema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=120), error_messages=REQUIRED)
    phone = fields.String(required=True, validate=validate_phone, error_messages=REQUIRED)
    email = fields.Email(required=True, validate=validate.Length(max=255), error_messages=REQUIRED)
    city = fields.String(allow_none=True, validate=validate.Length(max=80))
    service = fields.String(allow_none=True, validate=validate.OneOf(list(ENQUIRY_SERVICES)))
    message = fields.String(allow_none=True, validate=validate.Length(max=2000))
    captcha = fields.String(allow_none=True, load_only=True)


class EnquiryUpdateSchema(Schema):
    handled = fields.Boolean(required=True)


enquiry_schema = EnquirySchema()
enquiries_schema = EnquirySchema(many=True)
enquiry_create_schema = EnquiryCreateSchema()
enquiry_update_schema = EnquiryUpdateSchema()
