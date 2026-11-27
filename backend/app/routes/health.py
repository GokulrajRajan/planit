from flask import Blueprint

from app.utils.responses import success

health_bp = Blueprint("health", __name__)


@health_bp.get("")
def health():
    """For Render's health check and uptime monitors. It doesn't touch the database, so frequent checks
    don't keep the database awake (Neon bills the time it's awake)."""
    return success(data={"status": "ok"})
