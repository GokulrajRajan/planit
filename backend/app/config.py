import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


def normalize_database_url(url: str | None) -> str | None:
    """Hosted Postgres (Neon, Render) gives out postgres:// or postgresql:// URLs, which SQLAlchemy reads as
    the psycopg2 driver. This app uses psycopg 3, so point those URLs at it."""
    for prefix in ("postgres://", "postgresql://"):
        if url and url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix) :]
    return url


class BaseConfig:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = normalize_database_url(os.environ.get("DATABASE_URL"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Hosted databases drop idle connections (Neon also sleeps after 5 idle minutes), so each pooled
    # connection is checked before use and replaced after a few minutes.
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 300}

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 60))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 30))
    )
    # Access tokens travel in the Authorization header; only the refresh
    # token lives in a cookie, scoped to the refresh endpoint.
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_REFRESH_COOKIE_PATH = "/api/auth/refresh"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SECURE = os.environ.get("JWT_COOKIE_SECURE", "false").lower() == "true"
    JWT_COOKIE_SAMESITE = "Lax"

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    PER_PAGE_DEFAULT = 10
    PER_PAGE_MAX = 50

    # How many X-Forwarded-For entries to trust (rate limits and captcha use the visitor's IP).
    # Next.js forwards an incoming X-Forwarded-For unchanged, so a visitor could fake it: in production
    # the reverse proxy in front of Next.js must overwrite it (nginx:
    # `proxy_set_header X-Forwarded-For $remote_addr;`), and Flask must only be reachable through Next.js.
    TRUSTED_PROXY_COUNT = int(os.environ.get("TRUSTED_PROXY_COUNT", 1))

    # For hosting where Flask is publicly reachable (Render): a shared secret the Next.js server adds to every
    # request it forwards (frontend/proxy.ts and lib/site-data.ts). When set, the API answers only requests that
    # carry it, and takes the visitor's IP from the X-Planit-Client-IP header that Next.js sets, not from
    # X-Forwarded-For (TRUSTED_PROXY_COUNT is then unused). Leave it empty in local development.
    API_PROXY_SECRET = os.environ.get("API_PROXY_SECRET", "")

    # Rate limits use Flask-Limiter syntax. In-memory storage is per process: point
    # RATELIMIT_STORAGE_URI at Redis (redis://...) when running several gunicorn workers.
    RATELIMIT_STORAGE_URI = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_HEADERS_ENABLED = True
    LOGIN_RATE_LIMIT = "10 per minute"
    ENQUIRY_RATE_LIMIT = "5 per hour"
    NEWSLETTER_RATE_LIMIT = "10 per hour"

    # Any siteverify-style captcha works: Cloudflare Turnstile (default), hCaptcha or reCAPTCHA v2
    # (set CAPTCHA_VERIFY_URL). Without a secret key, forms are refused unless CAPTCHA_OPTIONAL is on
    # (development and testing only).
    CAPTCHA_SECRET_KEY = os.environ.get("CAPTCHA_SECRET_KEY", "")
    CAPTCHA_OPTIONAL = False
    CAPTCHA_VERIFY_URL = os.environ.get(
        "CAPTCHA_VERIFY_URL", "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    )

    # Outgoing email for enquiry notifications. Leave MAIL_SERVER empty to skip sending.
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "false").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "")
    MAIL_FROM = os.environ.get("MAIL_FROM", "")
    ENQUIRY_NOTIFY_TO = [
        address.strip()
        for address in os.environ.get("ENQUIRY_NOTIFY_TO", "").split(",")
        if address.strip()
    ]

    # Images uploaded in the admin panel go from the browser straight to Cloudinary, signed by this API.
    # The "API environment variable" from the Cloudinary dashboard: cloudinary://<key>:<secret>@<cloud name>.
    # Empty = no upload button; image links can still be pasted.
    CLOUDINARY_URL = os.environ.get("CLOUDINARY_URL", "")
    CLOUDINARY_FOLDER = os.environ.get("CLOUDINARY_FOLDER", "planit")

    # Config key → environment variable that create_app requires (see ProductionConfig).
    REQUIRED_SETTINGS: dict[str, str] = {}


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    CAPTCHA_OPTIONAL = True


class TestingConfig(BaseConfig):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = normalize_database_url(os.environ.get("TEST_DATABASE_URL"))
    JWT_COOKIE_CSRF_PROTECT = False
    RATELIMIT_ENABLED = False
    CAPTCHA_SECRET_KEY = ""
    CAPTCHA_OPTIONAL = True
    MAIL_SERVER = ""
    ENQUIRY_NOTIFY_TO = ["office@example.com"]


class ProductionConfig(BaseConfig):
    DEBUG = False
    # No development fallbacks: a missing key must stop the app, not sign tokens with a known value.
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_COOKIE_SECURE = os.environ.get("JWT_COOKIE_SECURE", "true").lower() == "true"
    REQUIRED_SETTINGS = {
        "SECRET_KEY": "SECRET_KEY",
        "JWT_SECRET_KEY": "JWT_SECRET_KEY",
        "SQLALCHEMY_DATABASE_URI": "DATABASE_URL",
        "API_PROXY_SECRET": "API_PROXY_SECRET",
    }


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    return config_by_name.get(env, DevelopmentConfig)
