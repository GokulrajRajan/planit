from flask import Blueprint, request

from app.models.user import UserRole
from app.schemas.settings_schema import site_settings_schema
from app.services.settings_service import get_settings, update_settings
from app.utils.decorators import role_required
from app.utils.responses import success

settings_bp = Blueprint("settings", __name__)


@settings_bp.get("")
def get_site_settings():
    return success(data={"settings": get_settings()})


@settings_bp.patch("")
@role_required(UserRole.ADMIN)
def patch_site_settings():
    changes = site_settings_schema.load(request.get_json(force=True, silent=True) or {})
    return success(data={"settings": update_settings(changes)}, message="Settings updated successfully")
