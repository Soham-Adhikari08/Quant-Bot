# backend/app.py
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from services.client import get_bse_live_data

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)

@app.route('/api/v1/status', methods=['GET'])
def health_check():
    #endpoints setup
    return jsonify({"status": "Quant-Bot Exchange Backend is online"}), 200

@app.route('/api/v1/market/quote/bse/<symbol>', methods=['GET'])
def bse_quote(symbol):
    # Route that fetches a live quote for a specific BSE stock
    data = get_bse_live_data(symbol)
    
    if "error" in data:
        return jsonify(data), 502 # 502 Bad Gateway for external API failures
        
    return jsonify(data), 200

if __name__ == '__main__':
    print("Starting Quant-Bot Backend on port 5000...")
    # debug=True auto-restarts the server when you save code changes
    app.run(host='0.0.0.0', port=5000, debug=True)