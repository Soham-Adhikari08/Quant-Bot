import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ChevronDown, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { fetchRealCandles } from '../../services/marketData';
import { STOCK_AI_SIGNALS } from '../../services/quantEngine';
import { CandlestickChart } from '../common/CandlestickChart';
import { CandleData } from '../../types/trading';

export const TradingTerminalView: React.FC = () => {
  const { 
    currentStock, 
    selectedSymbol, 
    setSelectedSymbol, 
    stocks, 
    account, 
    marketStatus, 
    simulationOverride, 
    setSimulationOverride, 
    executeTrade, 
    setActiveView 
  } = useTrading();

  const [orderCategory, setOrderCategory] = useState<'Market' | 'Limit' | 'Stop Loss'>('Market');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(currentStock.price);
  const [stopPrice, setStopPrice] = useState<number>(Number((currentStock.price * 0.975).toFixed(2)));
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [tradeFeedback, setTradeFeedback] = useState<{ type: 'error'; message: string } | null>(null);
  const [successToast, setSuccessToast] = useState<{ id: number; message: string; symbol: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setLimitPrice(currentStock.price);
    setStopPrice(Number((currentStock.price * 0.975).toFixed(2)));
  }, [selectedSymbol, currentStock.price]);

  useEffect(() => {
    let isMounted = true;
    fetchRealCandles(selectedSymbol, timeframe).then(data => {
      if (isMounted) setCandles(data);
    });
    return () => { isMounted = false; };
  }, [selectedSymbol, timeframe]);

  const signal = STOCK_AI_SIGNALS[selectedSymbol] || STOCK_AI_SIGNALS.RELIANCE;
  const executionPrice = orderCategory === 'Limit' ? limitPrice : currentStock.price;
  const orderValue = Number((quantity * executionPrice).toFixed(2));
  const isPositive = currentStock.changePercent >= 0;

  const handleExecute = () => {
    setTradeFeedback(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    const result = executeTrade({
      symbol: selectedSymbol,
      type: tradeType,
      orderCategory: orderCategory,
      quantity,
      price: executionPrice
    });

    if (result.success) {
      setSuccessToast({
        id: Date.now(),
        message: result.message,
        symbol: selectedSymbol
      });
      toastTimerRef.current = window.setTimeout(() => {
        setSuccessToast(null);
      }, 4500);
    } else if (result.isInsufficientFunds || result.isMarketClosed || result.message.includes('Insufficient cash balance')) {
      // Handled exclusively by centered modal popups (InsufficientFundsModal or MarketClosedModal)
    } else {
      // General non-modal error
      setTradeFeedback({ type: 'error', message: result.message });
      setTimeout(() => setTradeFeedback(null), 6000);
    }
  };

  const timeframes: ('1D' | '1W' | '1M' | '3M' | '1Y')[] = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header matching Collage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Trading Terminal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Execute trades with AI signals and risk management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Market Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-semibold text-slate-800">{marketStatus.statusText}</span>
          </div>

          {!marketStatus.isOpen && (
            <button
              onClick={() => setSimulationOverride(!simulationOverride)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                simulationOverride 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {simulationOverride ? 'Sandbox Simulation: ON' : 'Enable Off-Hours Trading'}
            </button>
          )}
        </div>
      </div>

      {/* Optional Non-Deficit Operational Alert (e.g. Market Closed) - Deficit banners are discarded */}
      {tradeFeedback && tradeFeedback.type === 'error' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{tradeFeedback.message}</span>
          </div>
          <button
            onClick={() => setTradeFeedback(null)}
            className="p-1 text-amber-700 hover:text-amber-950 rounded-lg cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3-Column Grid matching Collage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Stock Candlestick Chart (5 cols) matching Collage */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* Select Stock Dropdown */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Select Stock
              </label>
              <div className="relative">
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0F172A] cursor-pointer"
                >
                  {Object.keys(stocks).map(sym => (
                    <option key={sym} value={sym}>
                      {sym} — {stocks[sym]?.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Price Quote */}
            <div className="flex items-baseline gap-2.5 mb-4">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                ₹{currentStock.price.toFixed(2)}
              </span>
              <span className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? '+' : ''}{currentStock.change.toFixed(2)} ({isPositive ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
              </span>
            </div>

            {/* Candlestick Chart */}
            <div className="h-[280px]">
              <CandlestickChart
                candles={candles}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                height={280}
                showTimeframeSelector={false}
                allowZoom={true}
                symbol={selectedSymbol}
                stockName={currentStock.name}
              />
            </div>
          </div>

          {/* Timeframe selector at bottom of chart */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-mono">Zoom enabled</span>
            <div className="flex p-0.5 bg-slate-100 rounded-lg">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    timeframe === tf ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Order Placement Form (4 cols) matching Collage */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* BUY / SELL Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tradeType === 'BUY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tradeType === 'SELL' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Order Tabs: [Market] [Limit] [Stop Loss] matching Collage */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
              {(['Market', 'Limit', 'Stop Loss'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setOrderCategory(cat)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    orderCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quantity Input with + / - steppers */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Quantity (Shares)
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-l-xl transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full py-2 bg-slate-50 border-y border-slate-200 text-center font-mono font-bold text-sm text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-r-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Quantity Chips */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[5, 10, 25, 50, 100].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className={`flex-1 py-1 rounded-md text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        quantity === qty ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit / Stop Price inputs if selected */}
              {orderCategory === 'Limit' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Limit Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentStock.price)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              )}

              {orderCategory === 'Stop Loss' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Trigger Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(parseFloat(e.target.value) || currentStock.price)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              )}

              {/* Order Value */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Order Value</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹{orderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Risk Check Card matching Collage */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 mb-5">
              <span className="text-xs font-bold text-slate-800 block">Risk Check</span>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  {tradeType === 'BUY' && orderValue > account.virtualBalance ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Position Size</span>
                </div>
                <span className={`font-mono font-semibold ${tradeType === 'BUY' && orderValue > account.virtualBalance ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                  {tradeType === 'BUY' && orderValue > account.virtualBalance
                    ? `Deficit: -₹${(orderValue - account.virtualBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                    : `${((orderValue / account.virtualBalance) * 100).toFixed(1)}% (of capital)`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stop Loss</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">2.5% (0.1%)</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Max Loss</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">2.5% (0.1%)</span>
              </div>
            </div>
          </div>

          {/* Primary [Execute Trade] button matching Collage */}
          <button
            onClick={handleExecute}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              tradeType === 'BUY' 
                ? 'bg-[#0F172A] hover:bg-slate-800 text-white' 
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            Execute {tradeType} Trade
          </button>
        </div>

        {/* Column 3: AI Signal Card (3 cols) matching Collage */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 mb-4">
              AI Signal
            </h3>

            {/* Signal Badge & Confidence */}
            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-extrabold font-mono tracking-wider ${
                signal.decision === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {signal.decision}
              </span>
              <div className="text-xs text-slate-500 font-medium mt-2">
                Confidence: <strong className="text-slate-900 font-mono">{signal.confidence}%</strong>
              </div>
            </div>

            {/* Cost and Balance Summary */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Estimated Cost</span>
                <span className="font-bold text-slate-900">
                  ₹{orderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Available Balance</span>
                <span className="font-bold text-emerald-600">
                  ₹{account.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 italic text-center">
              This is a paper trade. No real money will be used.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Success Toast Notification */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full sm:w-auto bg-[#0F172A] border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-slate-950/80 text-white flex items-start gap-3.5 transition-all duration-300 select-none animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Order Executed
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {successToast.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 leading-snug">
              {successToast.message}
            </p>
            <button
              onClick={() => {
                setSuccessToast(null);
                setActiveView('portfolio');
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              <span>View in Portfolio</span>
              <span>&rarr;</span>
            </button>
          </div>

          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
