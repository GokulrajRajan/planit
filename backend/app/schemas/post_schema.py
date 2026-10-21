from marshmallow import Schema, fields, validate

from app.models.post import PostStatus, PostType
from app.schemas.category_schema import CategorySchema
from app.schemas.tag_schema import TagSchema
from app.schemas.user_schema import AuthorSchema


class PostSchema(Schema):
    id = fields.Integer(dump_only=True)
    title = fields.String(dump_only=True)
    slug = fields.String(dump_only=True)
    excerpt = fields.String(dump_only=True)
    content = fields.String(dump_only=True)
    cover_image_url = fields.String(dump_only=True, allow_none=True)
    status = fields.String(dump_only=True)
    post_type = fields.String(dump_only=True)
    author = fields.Nested(AuthorSchema, dump_only=True)
    category = fields.Nested(CategorySchema, dump_only=True, allow_none=True)
    tags = fields.List(fields.Nested(TagSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    published_at = fields.DateTime(dump_only=True, allow_none=True)


class PostSummarySchema(Schema):
    id = fields.Integer(dump_only=True)
    title = fields.String(dump_only=True)
    slug = fields.String(dump_only=True)
    excerpt = fields.String(dump_only=True)
    cover_image_url = fields.String(dump_only=True, allow_none=True)
    status = fields.String(dump_only=True)
    post_type = fields.String(dump_only=True)
    author = fields.Nested(AuthorSchema, dump_only=True)
    category = fields.Nested(CategorySchema, dump_only=True, allow_none=True)
    tags = fields.List(fields.Nested(TagSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    published_at = fields.DateTime(dump_only=True, allow_none=True)


class PostCreateSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=3, max=200))
    excerpt = fields.String(required=False, allow_none=True, validate=validate.Length(max=500))
    content = fields.String(required=True, validate=validate.Length(min=1))
    cover_image_url = fields.Url(required=False, allow_none=True)
    status = fields.String(required=False, validate=validate.OneOf(PostStatus.ALL))
    post_type = fields.String(required=False, validate=validate.OneOf(PostType.ALL))
    category_id = fields.Integer(required=False, allow_none=True)
    tag_names = fields.List(fields.String(validate=validate.Length(min=1, max=60)), required=False)


class PostUpdateSchema(Schema):
    title = fields.String(validate=validate.Length(min=3, max=200))
    excerpt = fields.String(allow_none=True, validate=validate.Length(max=500))
    content = fields.String(validate=validate.Length(min=1))
    cover_image_url = fields.Url(allow_none=True)
    status = fields.String(validate=validate.OneOf(PostStatus.ALL))
    post_type = fields.String(validate=validate.OneOf(PostType.ALL))
    category_id = fields.Integer(allow_none=True)
    tag_names = fields.List(fields.String(validate=validate.Length(min=1, max=60)))


post_schema = PostSchema()
post_summary_schema = PostSummarySchema()
posts_summary_schema = PostSummarySchema(many=True)
post_create_schema = PostCreateSchema()
post_update_schema = PostUpdateSchema(partial=True)
