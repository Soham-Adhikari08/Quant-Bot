import warnings
warnings.filterwarnings("ignore") 

import yfinance as yf

TIMEFRAME_MAP = {
    '1D': ('1d', '15m'),
    '1W': ('5d', '15m'),
    '1M': ('1mo', '1d'),
    '3M': ('3mo', '1d'),
    '1Y': ('1y', '1d'),
    'ALL': ('max', '1mo')
}

def get_live_quotes(symbols=['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN']):
    quotes = {}
    for sym in symbols:
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            data = ticker.history(period='5d') 
            
            if not data.empty:
                latest = data.iloc[-1]
                prev_close = data.iloc[-2]['Close'] if len(data) > 1 else latest['Open']
                quotes[sym] = {
                    "symbol": sym,
                    "name": ticker.info.get('longName', sym),
                    "price": float(latest['Close']),
                    "change": float(latest['Close'] - prev_close),
                    "changePercent": float(((latest['Close'] - prev_close) / prev_close) * 100),
                    "open": float(latest['Open']),
                    "high": float(latest['High']),
                    "low": float(latest['Low']),
                    "prevClose": float(prev_close),
                    "volume": int(latest['Volume']),
                    "isRealTime": True,
                    "lastUpdated": "Live (yfinance)"
                }
            else:
                # Strictly display 0 if no real data is returned
                quotes[sym] = {
                    "symbol": sym,
                    "name": sym,
                    "price": 0.0,
                    "change": 0.0,
                    "changePercent": 0.0,
                    "open": 0.0,
                    "high": 0.0,
                    "low": 0.0,
                    "prevClose": 0.0,
                    "volume": 0,
                    "isRealTime": False,
                    "lastUpdated": "No Data (0)"
                }
        except Exception as e:
            # Strictly display 0 on any network/API exception
            quotes[sym] = {
                "symbol": sym,
                "name": sym,
                "price": 0.0,
                "change": 0.0,
                "changePercent": 0.0,
                "open": 0.0,
                "high": 0.0,
                "low": 0.0,
                "prevClose": 0.0,
                "volume": 0,
                "isRealTime": False,
                "lastUpdated": "Error (0)"
            }
    
    return {"quotes": quotes}

def get_historical_candles(symbol, timeframe):
    period, interval = TIMEFRAME_MAP.get(timeframe, ('1y', '1d'))
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        data = ticker.history(period=period, interval=interval)
        
        candles = []
        if not data.empty:
            for index, row in data.iterrows():
                time_label = index.strftime('%d %b %H:%M') if 'm' in interval else index.strftime('%d %b %Y')
                candles.append({
                    "time": time_label,
                    "timestamp": int(index.timestamp() * 1000),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": int(row['Volume'])
                })
        return {"candles": candles}
    except Exception as e:
        return {"error": str(e), "candles": []}