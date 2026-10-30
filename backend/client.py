import yfinance as yf

def get_bse_live_data(symbol):
    """
    Fetches live/latest BSE market data directly using yfinance.
    """
    # Append .BO to specify the Bombay Stock Exchange
    bse_symbol = f"{symbol.upper()}.BO"
    
    try:
        ticker = yf.Ticker(bse_symbol)
        
        # Fetch the most recent day of trading data
        todays_data = ticker.history(period='1d')
        
        if todays_data.empty:
            return {"error": f"No market data found for {bse_symbol}"}
            
        # Extract the most recent OHLCV row
        latest = todays_data.iloc[-1]
        
        return {
            "symbol": bse_symbol,
            "current_price": float(latest['Close']),
            "open": float(latest['Open']),
            "high": float(latest['High']),
            "low": float(latest['Low']),
            "volume": int(latest['Volume'])
        }
        
    except Exception as e:
        print(f"[yfinance Error] Failed to fetch {bse_symbol}: {e}")
        return {"error": "Failed to fetch market data", "details": str(e)}