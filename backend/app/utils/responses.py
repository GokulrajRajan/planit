from flask import jsonify


def success(data=None, message: str = "Request successful", status: int = 200):
    payload = {"success": True, "data": data, "message": message}
    return jsonify(payload), status


def error(message: str = "Something went wrong", errors=None, status: int = 400):
    payload = {"success": False, "message": message, "errors": errors}
    return jsonify(payload), status
