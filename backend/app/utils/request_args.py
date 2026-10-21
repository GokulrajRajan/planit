from flask import request

from app.utils.errors import APIError


def choice_arg(name: str, choices) -> str | None:
    """Reads an optional query parameter that must be one of `choices`."""
    value = request.args.get(name) or None
    if value is not None and value not in choices:
        raise APIError(f"'{name}' must be one of: {', '.join(choices)}", status=400)
    return value
