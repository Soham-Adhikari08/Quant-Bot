from datetime import datetime, timezone

from flask import Blueprint, jsonify

bp = Blueprint("health", __name__, url_prefix="/api")


@bp.get("/health")
def health():
    # Import lazily so the route can be tested independently.
    try:
        from ..services.market_data import MarketDataService

        reachable = MarketDataService().check_connectivity()
    except Exception:
        reachable = False

    server_time = datetime.now(timezone.utc).isoformat()

    return jsonify({
        "status": "ok" if reachable else "degraded",
        "server_time": server_time,
        "yfinance_reachable": reachable,
        "time": server_time,
        "yfinance": {
            "reachable": reachable
        }
    })
