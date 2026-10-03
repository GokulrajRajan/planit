from marshmallow import Schema, fields, validate

from app.models.user import UserRole


class UserSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(dump_only=True)
    role = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class UserUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=2, max=120))
    role = fields.String(validate=validate.OneOf(UserRole.ALL))


user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_update_schema = UserUpdateSchema()
