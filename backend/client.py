import yfinance as yf
import pandas as pd

# Maps frontend timeframe requests to Yahoo Finance parameters
TIMEFRAME_MAP = {
    '1D': ('1d', '15m'),
    '1W': ('5d', '15m'),
    '1M': ('1mo', '1d'),
    '3M': ('3mo', '1d'),
    '1Y': ('1y', '1wk'),
    'ALL': ('max', '1mo')
}

def get_live_quotes(symbols=['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN']):
    quotes = {}
    for sym in symbols:
        try:
            ticker = yf.Ticker(f"{sym}.BO")
            data = ticker.history(period='1d')
            if not data.empty:
                latest = data.iloc[-1]
                # Fallback to opening price if previousClose is unavailable
                prev_close = ticker.info.get('previousClose', float(latest['Open']))
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
                    "volumeFormatted": f"{int(latest['Volume'])/1000000:.1f}M",
                    "week52High": ticker.info.get('fiftyTwoWeekHigh', float(latest['High'])),
                    "week52Low": ticker.info.get('fiftyTwoWeekLow', float(latest['Low'])),
                    "isRealTime": True,
                    "lastUpdated": "Live BSE"
                }
        except Exception as e:
            print(f"Error fetching {sym}: {e}")
    
    return {"quotes": quotes}

def get_historical_candles(symbol, timeframe):
    period, interval = TIMEFRAME_MAP.get(timeframe, ('1mo', '1d'))
    try:
        ticker = yf.Ticker(f"{symbol}.BO")
        data = ticker.history(period=period, interval=interval)
        
        candles = []
        for index, row in data.iterrows():
            # Format time for intraday vs multi-day views
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