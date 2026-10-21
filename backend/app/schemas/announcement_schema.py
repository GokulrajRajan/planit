from datetime import timezone

from marshmallow import Schema, fields, validate

from app.models.announcement import AnnouncementPlacement
from app.schemas.base import REQUIRED, TrimmedSchema
from app.utils.validators import validate_link


class AnnouncementSchema(Schema):
    id = fields.Integer(dump_only=True)
    text = fields.String(dump_only=True)
    link = fields.String(dump_only=True, allow_none=True)
    placement = fields.String(dump_only=True)
    starts_at = fields.DateTime(dump_only=True, allow_none=True)
    ends_at = fields.DateTime(dump_only=True, allow_none=True)
    active = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class AnnouncementWriteSchema(TrimmedSchema):
    text = fields.String(required=True, validate=validate.Length(min=1, max=300), error_messages=REQUIRED)
    link = fields.String(allow_none=True, validate=[validate.Length(max=500), validate_link])
    placement = fields.String(validate=validate.OneOf(AnnouncementPlacement.ALL))
    # Times without an offset are read as UTC.
    starts_at = fields.AwareDateTime(allow_none=True, default_timezone=timezone.utc)
    ends_at = fields.AwareDateTime(allow_none=True, default_timezone=timezone.utc)
    active = fields.Boolean()


announcement_schema = AnnouncementSchema()
announcements_schema = AnnouncementSchema(many=True)
announcement_create_schema = AnnouncementWriteSchema()
announcement_update_schema = AnnouncementWriteSchema(partial=True)
