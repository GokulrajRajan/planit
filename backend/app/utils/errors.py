from flask import current_app
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

from app.utils.responses import error


class APIError(Exception):
    """Raised for expected, user-facing API errors."""

    def __init__(self, message: str, status: int = 400, errors=None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.errors = errors


def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(exc: APIError):
        return error(message=exc.message, errors=exc.errors, status=exc.status)

    @app.errorhandler(ValidationError)
    def handle_validation_error(exc: ValidationError):
        return error(message="Validation failed", errors=exc.messages, status=422)

    @app.errorhandler(429)
    def handle_rate_limited(exc):
        return error(message="Too many requests. Please wait a while and try again.", status=429)

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        return error(message=exc.description, status=exc.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        current_app.logger.exception("Unhandled exception")
        if current_app.debug or current_app.testing:
            return error(message=str(exc), status=500)
        return error(message="An unexpected error occurred", status=500)
