from marshmallow import Schema, fields, validate


class CreateAdminSchema(Schema):
    """Validates `flask create-admin` input; there is no public sign-up."""

    name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=8, max=128))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)
