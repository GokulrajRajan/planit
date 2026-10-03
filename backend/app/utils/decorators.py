from functools import wraps

from flask_jwt_extended import get_jwt, verify_jwt_in_request

from app.utils.errors import APIError


def role_required(*allowed_roles: str):
    """Restrict an endpoint to callers whose JWT role claim is in allowed_roles."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in allowed_roles:
                raise APIError("You do not have permission to perform this action", status=403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
