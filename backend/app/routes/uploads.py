from flask import Blueprint

from app.models.user import UserRole
from app.services.upload_service import image_upload_params
from app.utils.decorators import role_required
from app.utils.responses import success

uploads_bp = Blueprint("uploads", __name__)


@uploads_bp.post("/image-signature")
@role_required(UserRole.ADMIN)
def sign_image_upload():
    """Signs one image upload, which the admin's browser then sends straight to Cloudinary, so the file
    never passes through this server."""
    return success(data=image_upload_params())
