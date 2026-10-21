import re
from urllib.parse import urlparse

from marshmallow import ValidationError

_PHONE = re.compile(r"^\+?[0-9][0-9 ()\-]*$")


def validate_link(value: str) -> None:
    """Accepts a full http(s) URL or a site path such as /services/sip-planning, never a bare '#'."""
    if value.startswith("/") and not value.startswith("//"):
        return
    parsed = urlparse(value)
    if parsed.scheme in ("http", "https") and parsed.netloc:
        return
    raise ValidationError("Enter a full URL (https://...) or a site path starting with /.")


def validate_phone(value: str) -> None:
    digits = re.sub(r"\D", "", value)
    if not _PHONE.match(value) or not 7 <= len(digits) <= 15:
        raise ValidationError("Enter a valid phone number.")
