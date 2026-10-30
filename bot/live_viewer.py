# bot/live_viewer.py
import requests
import time
from datetime import datetime

def watch_market(symbol):
    """Continuously fetches live data from your Flask backend."""
    # This points to your local Team A backend
    url = f"http://127.0.0.1:5000/api/v1/market/quote/bse/{symbol}"
    
    print(f"--- Quant-Bot Live Vision: Watching {symbol.upper()} ---")
    print("Press CTRL+C to stop monitoring.\n")
    
    while True:
        try:
            # The bot asks the backend for the data
            response = requests.get(url)
            data = response.json()
            
            if "error" not in data:
                now = datetime.now().strftime("%H:%M:%S")
                price = data['current_price']
                vol = data['volume']
                
                # Print a clean terminal dashboard
                print(f"[{now}] {symbol.upper()} | Price: ₹{price:,.2f} | Volume: {vol:,}")
            else:
                print(f"Backend Error: {data['error']}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend. Is Flask running on port 5000?")
            break
            
        # Wait 5 seconds before checking the price again
        time.sleep(5)

if __name__ == "__main__":
    # You can change this to TATASTEEL, HDFCBANK, etc.
    watch_market("HDFCBANK")