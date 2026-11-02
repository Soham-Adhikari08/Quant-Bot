from flask import Flask, jsonify, request
from flask_cors import CORS
from client import get_live_quotes, get_historical_candles

app = Flask(__name__)
CORS(app) # Enables the Vite frontend to communicate with Flask

@app.route('/api/market/quotes', methods=['GET'])
def market_quotes():
    """Serves the continuous live quote polling from the dashboard."""
    return jsonify(get_live_quotes())

@app.route('/api/market/candles/<symbol>', methods=['GET'])
def market_candles(symbol):
    """Serves historical OHLCV data for the SVG candlestick charts."""
    timeframe = request.args.get('timeframe', '1D')
    return jsonify(get_historical_candles(symbol, timeframe))

@app.route('/api/predict/fusion', methods=['POST'])
def predict_fusion():
    """Deliverable 2 Integration point for the Fusion Engine."""
    return jsonify({
        "status": "pending",
        "message": "Awaiting regression and classification model training."
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)