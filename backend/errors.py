"""Centralized JSON error handling for the API."""

import logging

from flask import jsonify
from werkzeug.exceptions import HTTPException

log = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(self, message, status=400, code="bad_request", details=None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code
        self.details = details or {}


def error_response(message, status, code, details=None):
    return jsonify({
        "error": message,
        "code": code,
        "details": details or {}
    }), status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(exc):
        return error_response(
            exc.message, exc.status, exc.code, exc.details
        )

    @app.errorhandler(HTTPException)
    def handle_http_error(exc):
        code = (exc.name or "error").lower().replace(" ", "_")
        return error_response(
            exc.description or exc.name,
            exc.code or 500,
            code
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc):
        log.exception("Unhandled API error")

        details = {}
        if app.config.get("DEBUG"):
            details["exception"] = f"{type(exc).__name__}: {exc}"

        return error_response(
            "Internal server error",
            500,
            "internal_error",
            details
        )
