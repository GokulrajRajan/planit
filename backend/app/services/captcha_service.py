import json
from urllib import parse
from urllib import request as urlrequest

from flask import current_app

from app.utils.errors import APIError


def _ask_provider(token: str, remote_ip: str | None) -> bool:
    payload = {"secret": current_app.config["CAPTCHA_SECRET_KEY"], "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    req = urlrequest.Request(
        current_app.config["CAPTCHA_VERIFY_URL"], data=parse.urlencode(payload).encode(), method="POST"
    )
    try:
        with urlrequest.urlopen(req, timeout=5) as response:
            return bool(json.load(response).get("success"))
    except (OSError, ValueError):
        current_app.logger.exception("Captcha verification request failed")
        return False


def verify_captcha(token: str | None, remote_ip: str | None) -> None:
    """Raises APIError unless the captcha token checks out with the provider."""
    if not current_app.config["CAPTCHA_SECRET_KEY"]:
        # Not app.debug: `flask run` resets that to False unless FLASK_DEBUG is set.
        if current_app.config["CAPTCHA_OPTIONAL"]:
            return
        raise APIError("Captcha is not configured on the server", status=503)

    if not token or not _ask_provider(token, remote_ip):
        raise APIError(
            "Captcha verification failed. Please try again.",
            status=400,
            errors={"captcha": ["Please complete the captcha."]},
        )
