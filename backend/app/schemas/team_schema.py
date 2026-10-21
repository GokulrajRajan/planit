from marshmallow import Schema, fields, validate

from app.schemas.base import REQUIRED, TrimmedSchema
from app.utils.validators import validate_link


class TeamMemberSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(dump_only=True)
    designation = fields.String(dump_only=True, allow_none=True)
    qualifications = fields.String(dump_only=True, allow_none=True)
    bio = fields.String(dump_only=True, allow_none=True)
    photo_url = fields.String(dump_only=True, allow_none=True)
    linkedin_url = fields.String(dump_only=True, allow_none=True)
    sort_order = fields.Integer(dump_only=True)
    visible = fields.Boolean(dump_only=True)


class TeamMemberWriteSchema(TrimmedSchema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=120), error_messages=REQUIRED)
    designation = fields.String(allow_none=True, validate=validate.Length(max=120))
    qualifications = fields.String(allow_none=True, validate=validate.Length(max=200))
    bio = fields.String(allow_none=True, validate=validate.Length(max=2000))
    photo_url = fields.String(allow_none=True, validate=[validate.Length(max=500), validate_link])
    linkedin_url = fields.Url(allow_none=True, schemes={"http", "https"}, validate=validate.Length(max=500))
    sort_order = fields.Integer()
    visible = fields.Boolean()


team_member_schema = TeamMemberSchema()
team_members_schema = TeamMemberSchema(many=True)
team_member_create_schema = TeamMemberWriteSchema()
team_member_update_schema = TeamMemberWriteSchema(partial=True)
