import yfinance as yf
import pandas as pd
from datetime import datetime, timezone
import pytz
from cachetools import TTLCache

class MarketDataService:
    def __init__(self):
        # In-memory TTL cache to prevent hammering Yahoo
        self.quotes_cache = TTLCache(maxsize=100, ttl=15)
        self.candles_cache = TTLCache(maxsize=500, ttl=60)
        self.valid_intervals = {'1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'}

    def get_server_time(self):
        return datetime.now(timezone.utc).isoformat()

    def check_connectivity(self):
        try:
            return not yf.download("AAPL", period="1d", progress=False).empty
        except Exception:
            return False

    def get_quotes(self, symbols):
        cache_key = tuple(sorted(symbols))
        if cache_key in self.quotes_cache:
            return self.quotes_cache[cache_key]

        results = []
        try:
            # Batch download for speed and to avoid rate limits
            df = yf.download(symbols, period="5d", interval="1d", group_by="ticker", progress=False)
            
            for sym in symbols:
                if isinstance(df.columns, pd.MultiIndex):
                    if sym not in df.columns.get_level_values(0):
                        continue
                    sym_data = df[sym]
                else:
                    sym_data = df

    # Ignore rows without a valid closing price
                valid_data = sym_data.dropna(subset=['Close'])

                if valid_data.empty:
                    continue

                latest = valid_data.iloc[-1]

                current_price = float(latest['Close'])
                prev_close = (
                    float(valid_data['Close'].iloc[-2])
                    if len(valid_data) > 1
                    else current_price
                )

                change = current_price - prev_close
                change_percent = (change / prev_close) * 100 if prev_close else 0.0

                results.append({
                    "symbol": sym,
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "change_percent": round(change_percent, 2),
                    "day_high": round(float(latest['High']), 2),
                    "day_low": round(float(latest['Low']), 2),
                    "volume": int(latest['Volume']) if pd.notna(latest['Volume']) else 0,
                    "timestamp": self.get_server_time(),
                    "is_delayed": True,
                    "market_state": self._get_market_state(sym)
                })
                
            if results:
                self.quotes_cache[cache_key] = results
            return results
        except Exception as e:
            # Fallback to stale cache if yfinance fails
            return [dict(q, is_delayed=True, error=str(e)) for q in self.quotes_cache.get(cache_key, [])]

    def get_candles(self, symbol, interval, period):
        if interval not in self.valid_intervals:
            raise ValueError(f"Invalid interval. Must be one of: {', '.join(self.valid_intervals)}")

        cache_key = (symbol, interval, period)
        if cache_key in self.candles_cache:
            return self.candles_cache[cache_key]

        df = yf.download(symbol, interval=interval, period=period, progress=False)
        if df.empty:
            return []

        # Flatten MultiIndex columns returned by newer yfinance versions
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.droplevel(1)

        df.reset_index(inplace=True)
        time_col = 'Datetime' if 'Datetime' in df.columns else 'Date'
        
        records = []
        for _, row in df.iterrows():
            if pd.isna(row['Close']): continue
            records.append({
                "time": int(row[time_col].timestamp()),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume'])
            })
            
        self.candles_cache[cache_key] = records
        return records

    def _get_market_state(self, symbol):
        utc_now = datetime.now(timezone.utc)
        if symbol.endswith('.NS') or symbol.endswith('.BO'):
            # NSE/BSE Hours
            ist = utc_now.astimezone(pytz.timezone('Asia/Kolkata'))
            return "OPEN" if ist.weekday() < 5 and (9 <= ist.hour <= 15) else "CLOSED"
        else:
            # NYSE/NASDAQ Hours
            ny_tz = utc_now.astimezone(pytz.timezone('America/New_York'))
            return "OPEN" if ny_tz.weekday() < 5 and (9 <= ny_tz.hour <= 16) else "CLOSED"  
