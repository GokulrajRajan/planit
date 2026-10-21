from marshmallow import Schema, fields, validate

from app.schemas.base import REQUIRED, TrimmedSchema


class TestimonialSchema(Schema):
    id = fields.Integer(dump_only=True)
    author_name = fields.String(dump_only=True)
    author_detail = fields.String(dump_only=True, allow_none=True)
    content = fields.String(dump_only=True)
    sort_order = fields.Integer(dump_only=True)
    visible = fields.Boolean(dump_only=True)


class TestimonialWriteSchema(TrimmedSchema):
    author_name = fields.String(required=True, validate=validate.Length(min=2, max=120), error_messages=REQUIRED)
    author_detail = fields.String(allow_none=True, validate=validate.Length(max=120))
    content = fields.String(required=True, validate=validate.Length(min=1, max=1000), error_messages=REQUIRED)
    sort_order = fields.Integer()
    visible = fields.Boolean()


testimonial_schema = TestimonialSchema()
testimonials_schema = TestimonialSchema(many=True)
testimonial_create_schema = TestimonialWriteSchema()
testimonial_update_schema = TestimonialWriteSchema(partial=True)
