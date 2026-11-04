import pytest

from backend.app import create_app
from backend.routes.market import service


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "status" in response.json


def test_quotes_response_structure(client, monkeypatch):
    monkeypatch.setattr(
        service,
        "get_quotes",
        lambda symbols: [{
            "symbol": "RELIANCE.NS",
            "price": 1300.0,
            "change": 10.0,
            "change_percent": 0.77,
            "day_high": 1310.0,
            "day_low": 1290.0,
            "volume": 1000000,
            "timestamp": "2026-11-04T10:00:00+00:00"
        }]
    )

    response = client.get("/api/market/quotes")
    assert response.status_code == 200
    assert "quotes" in response.json
    quote = response.json["quotes"]["RELIANCE"]
    assert quote["price"] == 1300.0
    assert "changePercent" in quote
    assert "volumeFormatted" in quote


def test_candles_response_structure(client, monkeypatch):
    monkeypatch.setattr(
        service,
        "get_candles",
        lambda symbol, interval, period: [{
            "time": 1791158400,
            "open": 1171.2,
            "high": 1193.0,
            "low": 1171.2,
            "close": 1186.4,
            "volume": 14254907
        }]
    )

    response = client.get(
        "/api/market/candles/RELIANCE.NS?timeframe=1M"
    )
    assert response.status_code == 200
    candle = response.json["candles"][0]
    assert candle["timestamp"] == 1791158400000
    assert isinstance(candle["time"], str)
    assert all(key in candle for key in [
        "open", "high", "low", "close", "volume"
    ])


def test_invalid_timeframe(client):
    response = client.get(
        "/api/market/candles/RELIANCE.NS?timeframe=INVALID"
    )
    assert response.status_code == 400
    assert response.json["code"] == "invalid_timeframe"


def test_prediction_fallback(client):
    response = client.post(
        "/api/predict/fusion",
        json={"symbol": "RELIANCE.NS"}
    )
    assert response.status_code == 200
    assert response.json["model_trained"] is False
    assert response.json["action"] == "HOLD"


def test_prediction_requires_symbol(client):
    response = client.post("/api/predict/fusion", json={})
    assert response.status_code == 400


def test_unknown_route_returns_json_error(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.is_json

