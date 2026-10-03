from marshmallow import Schema, fields, validate


class CategorySchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(dump_only=True)
    slug = fields.String(dump_only=True)


class CategoryWriteSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))


category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)
category_write_schema = CategoryWriteSchema()
