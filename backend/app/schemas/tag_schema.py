from marshmallow import Schema, fields, validate


class TagSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(dump_only=True)
    slug = fields.String(dump_only=True)


class TagWriteSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=60))


tag_schema = TagSchema()
tags_schema = TagSchema(many=True)
tag_write_schema = TagWriteSchema()
