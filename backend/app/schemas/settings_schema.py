from marshmallow import fields, validate

from app.schemas.base import REQUIRED, TrimmedSchema
from app.utils.validators import validate_link, validate_phone

# Sections the admin can switch off. A switched-on section still stays hidden until the data it
# needs exists (see settings_service.visible_sections).
SECTION_KEYS = (
    "announcement_bar",
    "stats",
    "testimonials",
    "team",
    "newsletter",
    "faq",
    "market_update",
    "registration_details",
    "grievance_officer",
    "office_map",
    "social_links",
    "client_login",
)


def _text(max_length: int):
    return fields.String(allow_none=True, validate=validate.Length(max=max_length))


def _url():
    return fields.Url(allow_none=True, schemes={"http", "https"}, validate=validate.Length(max=1000))


def _colour():
    return fields.String(
        allow_none=True, validate=validate.Regexp(r"^#[0-9a-fA-F]{6}$", error="Use a hex colour such as #1F4E3D.")
    )


class BrandingSchema(TrimmedSchema):
    """Empty values fall back to the placeholder brand tokens in the frontend's globals.css."""

    logo_url = fields.String(allow_none=True, validate=[validate.Length(max=1000), validate_link])
    primary_color = _colour()
    accent_color = _colour()


class OfficeSchema(TrimmedSchema):
    legal_name = _text(200)
    address_line1 = _text(200)
    address_line2 = _text(200)
    city = _text(80)
    state = _text(80)
    pincode = fields.String(
        allow_none=True, validate=validate.Regexp(r"^\d{6}$", error="Enter a 6-digit PIN code.")
    )
    phone = fields.String(allow_none=True, validate=validate_phone)
    email = fields.Email(allow_none=True)
    hours = _text(120)
    map_embed_url = _url()
    google_business_url = _url()


class RegistrationSchema(TrimmedSchema):
    arn = fields.String(
        allow_none=True, validate=validate.Regexp(r"^ARN-\d{1,10}$", error="Use the format ARN-123456.")
    )
    arn_valid_from = fields.Date(allow_none=True)
    arn_valid_until = fields.Date(allow_none=True)
    euin = fields.String(
        allow_none=True, validate=validate.Regexp(r"^E\d{1,10}$", error="Use the format E123456.")
    )
    euin_valid_until = fields.Date(allow_none=True)
    cin = fields.String(
        allow_none=True,
        validate=validate.Regexp(
            r"^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$", error="Enter the 21-character CIN, e.g. U67190TN2020PTC123456."
        ),
    )


class GrievanceOfficerSchema(TrimmedSchema):
    name = _text(120)
    designation = _text(120)
    email = fields.Email(allow_none=True)
    phone = fields.String(allow_none=True, validate=validate_phone)
    address = _text(300)


class SocialLinksSchema(TrimmedSchema):
    facebook = _url()
    instagram = _url()
    linkedin = _url()
    x = _url()
    youtube = _url()


class CtaSchema(TrimmedSchema):
    start_sip_url = fields.String(allow_none=True, validate=[validate.Length(max=1000), validate_link])
    open_account_url = fields.String(allow_none=True, validate=[validate.Length(max=1000), validate_link])


class StatSchema(TrimmedSchema):
    label = fields.String(required=True, validate=validate.Length(min=1, max=60), error_messages=REQUIRED)
    value = fields.String(required=True, validate=validate.Length(min=1, max=20), error_messages=REQUIRED)
    # e.g. "As of 30 Sep 2026", shown under the figure.
    note = _text(120)


SectionsSchema = TrimmedSchema.from_dict({key: fields.Boolean() for key in SECTION_KEYS}, name="SectionsSchema")


class SiteSettingsSchema(TrimmedSchema):
    """Every field is optional: details the client hasn't supplied yet stay empty."""

    branding = fields.Nested(BrandingSchema)
    office = fields.Nested(OfficeSchema)
    registration = fields.Nested(RegistrationSchema)
    grievance_officer = fields.Nested(GrievanceOfficerSchema)
    social_links = fields.Nested(SocialLinksSchema)
    portal_url = _url()
    cta = fields.Nested(CtaSchema)
    stats = fields.List(fields.Nested(StatSchema), validate=validate.Length(max=6))
    sections = fields.Nested(SectionsSchema)


# Groups that are merged key by key on update; everything else is replaced whole.
SETTINGS_GROUPS = {
    "branding": BrandingSchema,
    "office": OfficeSchema,
    "registration": RegistrationSchema,
    "grievance_officer": GrievanceOfficerSchema,
    "social_links": SocialLinksSchema,
    "cta": CtaSchema,
}

site_settings_schema = SiteSettingsSchema()
