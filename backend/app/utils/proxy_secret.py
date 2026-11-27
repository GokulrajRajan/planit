import hmac
import ipaddress
import json

# Answered without the secret: Render's health check and uptime monitors call it directly.
OPEN_PATHS = frozenset({"/api/health"})

_FORBIDDEN = json.dumps({"success": False, "message": "Forbidden", "errors": None}).encode()


def _valid_ip(value: str) -> bool:
    try:
        ipaddress.ip_address(value)
    except ValueError:
        return False
    return True


class RequireProxySecret:
    """WSGI middleware for hosting where Flask is publicly reachable (Render) but should only be used through
    the Next.js server, which adds the shared secret to every request it forwards (frontend/proxy.ts).

    Requests without the secret are refused, and the visitor's IP (rate limits, captcha) is taken from the
    X-Planit-Client-IP header that the Next.js proxy sets after dropping any value the visitor sent. Both
    headers are removed before the app sees the request, so the secret never reaches logs or handlers.
    """

    def __init__(self, app, secret: str):
        self.app = app
        self.secret = secret.encode()

    def __call__(self, environ, start_response):
        supplied = environ.pop("HTTP_X_PLANIT_PROXY_SECRET", "")
        client_ip = environ.pop("HTTP_X_PLANIT_CLIENT_IP", "").strip()

        # WSGI header values are latin-1 decoded strings, so this round-trips whatever bytes were sent.
        if not hmac.compare_digest(supplied.encode("latin-1"), self.secret):
            if environ.get("PATH_INFO") in OPEN_PATHS:
                return self.app(environ, start_response)
            start_response(
                "403 FORBIDDEN",
                [("Content-Type", "application/json"), ("Content-Length", str(len(_FORBIDDEN)))],
            )
            return [_FORBIDDEN]

        if _valid_ip(client_ip):
            environ["REMOTE_ADDR"] = client_ip
        return self.app(environ, start_response)
