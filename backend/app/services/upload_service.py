import hashlib
import time
from urllib.parse import unquote, urlsplit

from flask import current_app

from app.utils.errors import APIError

# What the admin can upload. SVG is left out because an SVG file can carry scripts.
ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif,gif"


def sign_params(params: dict, api_secret: str) -> str:
    """Cloudinary's request signature: the parameters sorted by name and joined as key=value pairs with &,
    followed by the API secret, hashed with SHA-1."""
    to_sign = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return hashlib.sha1((to_sign + api_secret).encode()).hexdigest()


def _credentials() -> tuple[str, str, str] | None:
    """(cloud name, API key, API secret) from CLOUDINARY_URL, or None when uploads aren't set up."""
    url = urlsplit(current_app.config["CLOUDINARY_URL"].strip())
    if url.scheme != "cloudinary" or not (url.username and url.password and url.hostname):
        return None
    # .hostname would lower-case the cloud name.
    cloud_name = url.netloc.rpartition("@")[2]
    return cloud_name, unquote(url.username), unquote(url.password)


def image_upload_params() -> dict:
    """What the admin's browser needs to upload one image straight to Cloudinary. Cloudinary accepts the
    signature for an hour."""
    credentials = _credentials()
    if credentials is None:
        raise APIError("Image uploads aren't set up yet. Paste a link to the image instead.", status=503)
    cloud_name, api_key, api_secret = credentials

    params = {
        "allowed_formats": ALLOWED_FORMATS,
        "folder": current_app.config["CLOUDINARY_FOLDER"],
        "timestamp": int(time.time()),
    }
    params = {key: value for key, value in params.items() if value not in ("", None)}
    return {
        "upload_url": f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload",
        "fields": {**params, "api_key": api_key, "signature": sign_params(params, api_secret)},
    }
