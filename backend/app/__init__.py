from flask import Flask

from app.config import get_config
from app.extensions import cors, db, jwt, ma, migrate
from app.utils.errors import register_error_handlers
from app.utils.responses import error


def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    register_error_handlers(app)
    register_jwt_callbacks(app)
    register_blueprints(app)

    return app


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
    from app.routes.auth import auth_bp
    from app.routes.categories import categories_bp
    from app.routes.comments import comments_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.posts import posts_bp
    from app.routes.tags import tags_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(tags_bp, url_prefix="/api/tags")
    app.register_blueprint(comments_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
