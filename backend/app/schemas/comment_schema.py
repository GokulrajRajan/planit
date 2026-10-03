from marshmallow import Schema, fields, validate

from app.schemas.user_schema import UserSchema


class CommentSchema(Schema):
    id = fields.Integer(dump_only=True)
    content = fields.String(dump_only=True)
    post_id = fields.Integer(dump_only=True)
    user = fields.Nested(UserSchema, dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class CommentCreateSchema(Schema):
    content = fields.String(required=True, validate=validate.Length(min=1, max=2000))


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)
comment_create_schema = CommentCreateSchema()
