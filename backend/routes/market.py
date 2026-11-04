"""Market data API routes."""

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from ..errors import ApiError
from ..services.market_data import MarketDataService

bp = Blueprint("market", __name__, url_prefix="/api/market")

service = MarketDataService()

DEFAULT_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS",
    "INFY.NS", "ICICIBANK.NS", "SBIN.NS"
]

TIMEFRAME_MAP = {
    "1D": ("1d", "5m"),
    "1W": ("5d", "15m"),
    "1M": ("1mo", "1d"),
    "3M": ("3mo", "1d"),
    "1Y": ("1y", "1d"),
    "ALL": ("max", "1mo"),
}


def format_volume(value):
    if value >= 1_000_000_000:
        return f"{value / 1_000_000_000:.2f}B"
    if value >= 1_000_000:
        return f"{value / 1_000_000:.2f}M"
    if value >= 1_000:
        return f"{value / 1_000:.2f}K"
    return str(value)


@bp.get("/quotes")
def quotes():
    requested = request.args.get("symbols", "")
    symbols = (
        [item.strip().upper() for item in requested.split(",") if item.strip()]
        if requested else DEFAULT_SYMBOLS
    )

    if not symbols or len(symbols) > 25:
        raise ApiError("Invalid symbol list", 400, "invalid_symbols")

    raw_quotes = service.get_quotes(symbols)
    formatted = {}

    for quote in raw_quotes:
        volume = quote.get("volume", 0)
        price = quote.get("price", 0)

        frontend_symbol = quote["symbol"].replace(".NS", "").replace(".BO", "")
        formatted[frontend_symbol] = {
            "symbol": frontend_symbol,
            "name": frontend_symbol,
            "price": price,
            "change": quote.get("change", 0),
            "changePercent": quote.get("change_percent", 0),
            "open": price,
            "high": quote.get("day_high", price),
            "low": quote.get("day_low", price),
            "prevClose": price - quote.get("change", 0),
            "volume": volume,
            "volumeFormatted": format_volume(volume),
            "week52High": quote.get("day_high", price),
            "week52Low": quote.get("day_low", price),
            "isRealTime": False,
            "lastUpdated": quote.get("timestamp", datetime.now(timezone.utc).isoformat())
        }

    return jsonify({
        "quotes": formatted,
        "missing": [symbol for symbol in symbols if symbol.replace(".NS", "").replace(".BO", "") not in formatted]
    })


@bp.get("/candles/<symbol>")
def candles(symbol):
    symbol = symbol.strip().upper()
    indian_symbols = {
        "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
        "SBIN", "BHARTIARTL", "ITC", "TATAMOTORS", "KOTAKBANK"
    }
    if symbol in indian_symbols:
        symbol += ".NS"
    timeframe = request.args.get("timeframe", "1M").upper()

    if timeframe not in TIMEFRAME_MAP:
        raise ApiError(
            f"Unsupported timeframe: {timeframe}",
            400,
            "invalid_timeframe",
            {"allowed": list(TIMEFRAME_MAP)}
        )

    period, interval = TIMEFRAME_MAP[timeframe]

    try:
        records = service.get_candles(symbol, interval, period)
    except ValueError as exc:
        raise ApiError(str(exc), 400, "invalid_candle_request")

    formatted = []

    for candle in records:
        timestamp = candle["time"] * 1000
        date = datetime.fromtimestamp(
            timestamp / 1000, tz=timezone.utc
        )

        formatted.append({
            "time": date.strftime("%H:%M") if interval.endswith("m") else date.strftime("%d %b"),
            "timestamp": timestamp,
            "open": candle["open"],
            "high": candle["high"],
            "low": candle["low"],
            "close": candle["close"],
            "volume": candle["volume"]
        })

    return jsonify({
        "symbol": symbol,
        "timeframe": timeframe,
        "candles": formatted
    })



