from flask_jwt_extended import get_jwt_identity
from flask import Blueprint

from app.models.user import UserRole
from app.services.auth_service import get_user_or_404
from app.services.dashboard_service import get_stats
from app.utils.decorators import role_required
from app.utils.responses import success

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/stats")
@role_required(UserRole.AUTHOR, UserRole.ADMIN)
def stats():
    user = get_user_or_404(int(get_jwt_identity()))
    return success(data={"stats": get_stats(user)})
