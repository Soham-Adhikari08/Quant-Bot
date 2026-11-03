from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np

app = Flask(__name__)
# Enable CORS so your React frontend (running on localhost:5173 or similar) can access the API
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Quant-Bot backend is running."}), 200

@app.route('/api/market/quotes', methods=['GET'])
def get_market_quotes():
    """
    Fetches real-time stock quotes using yfinance.
    Accepts a comma-separated list of symbols via query param, e.g., ?symbols=AAPL,MSFT,RELIANCE.NS
    """
    symbols_param = request.args.get('symbols', 'AAPL,GOOGL,MSFT,TSLA')
    symbols = [s.strip().upper() for s in symbols_param.split(',')]
    
    quotes = {}
    try:
        for symbol in symbols:
            ticker = yf.Ticker(symbol)
            # Fetch fast info or historical daily data to get the latest close/price
            todays_data = ticker.history(period="1d")
            if not todays_data.empty:
                current_price = float(todays_data['Close'].iloc[-1])
                prev_close = float(ticker.info.get('previousClose', current_price))
                change = current_price - prev_close
                change_percent = (change / prev_close) * 100 if prev_close else 0.0
                
                quotes[symbol] = {
                    "symbol": symbol,
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "changePercent": round(change_percent, 2),
                    "volume": int(todays_data['Volume'].iloc[-1])
                }
            else:
                quotes[symbol] = {"error": "No data found for symbol"}
                
        return jsonify(quotes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/market/candles/<symbol>', methods=['GET'])
def get_market_candles(symbol):
    """
    Fetches historical OHLCV candle data for a given symbol from yfinance.
    Query params: period (default: '1mo'), interval (default: '1d')
    """
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1d')
    
    try:
        ticker = yf.Ticker(symbol.upper())
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            return jsonify({"error": f"No historical data found for {symbol}"}), 404
            
        candles = []
        for index, row in df.iterrows():
            candles.append({
                "time": int(index.timestamp()), # Unix timestamp for charting libraries
                "date": index.strftime('%Y-%m-%d %H:%M:%S'),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume'])
            })
            
        return jsonify({
            "symbol": symbol.upper(),
            "period": period,
            "interval": interval,
            "candles": candles
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict/fusion', methods=['POST'])
def predict_fusion():
    """
    Stub/Active endpoint for the Fusion Engine combining Regression & Classification models.
    """
    data = request.get_json() or {}
    symbol = data.get('symbol', 'AAPL')
    
    try:
        # Fetch latest market indicators to pass into models
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="5d", interval="1d")
        
        if df.empty:
            return jsonify({"error": "Unable to fetch data for prediction"}), 400
            
        latest_close = float(df['Close'].iloc[-1])
        
        # NOTE: Since models are currently untrained (as noted in your report project debt), 
        # return structured mock-calibrated JSON so the frontend terminal doesn't crash.
        # Once your training loops finish, plug your model.predict() pipelines here.
        mock_regression_magnitude = 0.015  # 1.5% expected move
        mock_classification_prob = 0.72    # 72% confidence UP
        
        # Fusion Engine Formula: Signal = Regression * (2 * Probability - 1)
        fusion_signal = mock_regression_magnitude * (2 * mock_classification_prob - 1)
        
        action = "HOLD"
        if fusion_signal > 0.005:
            action = "BUY"
        elif fusion_signal < -0.005:
            action = "SELL"

        return jsonify({
            "symbol": symbol,
            "currentPrice": latest_close,
            "regressionPrediction": mock_regression_magnitude,
            "classificationProbability": mock_classification_prob,
            "fusionSignal": round(fusion_signal, 4),
            "recommendedAction": action,
            "status": "success"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)