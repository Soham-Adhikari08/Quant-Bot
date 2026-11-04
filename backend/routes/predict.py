"""Prediction API routes."""

from flask import Blueprint, jsonify, request

from ..errors import ApiError

bp = Blueprint("predict", __name__, url_prefix="/api/predict")


@bp.post("/fusion")
def fusion():
    payload = request.get_json(silent=True) or {}
    symbol = payload.get("symbol")

    if not isinstance(symbol, str) or not symbol.strip():
        raise ApiError(
            "Request body must include a valid symbol",
            400,
            "missing_symbol"
        )

    symbol = symbol.strip().upper()

    return jsonify({
        "symbol": symbol,
        "model_trained": False,
        "signal": 0.0,
        "action": "HOLD",
        "confidence": 0.0,
        "regression_prediction": None,
        "reason": "No trained prediction model is currently available."
    })
