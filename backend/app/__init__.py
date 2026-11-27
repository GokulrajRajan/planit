from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from app.cli import register_commands
from app.config import get_config
from app.extensions import cors, db, jwt, limiter, ma, migrate
from app.utils.errors import register_error_handlers
from app.utils.proxy_secret import RequireProxySecret
from app.utils.responses import error


def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or get_config())
    check_required_settings(app)

    # Every request arrives through the Next.js proxy. When Flask is publicly reachable (Render), the proxy
    # proves it with a shared secret and passes the visitor's IP (used for rate limits and captcha checks)
    # in its own header; behind a private reverse proxy, the IP comes from X-Forwarded-For.
    if app.config["API_PROXY_SECRET"]:
        app.wsgi_app = RequireProxySecret(app.wsgi_app, app.config["API_PROXY_SECRET"])
    elif app.config["TRUSTED_PROXY_COUNT"] > 0:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=app.config["TRUSTED_PROXY_COUNT"])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    register_error_handlers(app)
    register_jwt_callbacks(app)
    register_blueprints(app)
    register_commands(app)

    return app


def check_required_settings(app):
    """Stops a production start with a clear message instead of running on missing secrets."""
    missing = [env for key, env in app.config.get("REQUIRED_SETTINGS", {}).items() if not app.config.get(key)]
    if missing:
        raise RuntimeError(f"Set these environment variables before starting the API: {', '.join(missing)}")


def register_jwt_callbacks(app):
    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return error(message="Authentication required", status=401)

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return error(message="Invalid authentication token", status=401)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error(message="Authentication token has expired", status=401)

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return error(message="Authentication token has been revoked", status=401)


def register_blueprints(app):
    from app.routes.announcements import announcements_bp
    from app.routes.auth import auth_bp
    from app.routes.categories import categories_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.enquiries import enquiries_bp
    from app.routes.health import health_bp
    from app.routes.newsletter import newsletter_bp
    from app.routes.posts import posts_bp
    from app.routes.settings import settings_bp
    from app.routes.tags import tags_bp
    from app.routes.team import team_bp
    from app.routes.testimonials import testimonials_bp
    from app.routes.uploads import uploads_bp
    from app.routes.users import users_bp

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(tags_bp, url_prefix="/api/tags")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(enquiries_bp, url_prefix="/api/enquiries")
    app.register_blueprint(announcements_bp, url_prefix="/api/announcements")
    app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")
    app.register_blueprint(team_bp, url_prefix="/api/team")
    app.register_blueprint(testimonials_bp, url_prefix="/api/testimonials")
    app.register_blueprint(uploads_bp, url_prefix="/api/uploads")
