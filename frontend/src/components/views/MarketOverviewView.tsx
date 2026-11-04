import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Clock, 
  TrendingUp, 
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { fetchRealCandles, computeTechnicalIndicators } from '../../services/marketData';
import { CandlestickChart } from '../common/CandlestickChart';
import { MarketTimeline } from '../common/MarketTimeline';
import { CandleData } from '../../types/trading';

export const MarketOverviewView: React.FC = () => {
  const { currentStock, selectedSymbol, setSelectedSymbol, stocks, marketStatus, setActiveView } = useTrading();
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');
  const [activeIndicatorTab, setActiveIndicatorTab] = useState<'SMA' | 'RSI' | 'MACD' | 'Bollinger Bands' | 'None'>('SMA');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(false);
  const [stockSearch, setStockSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoadingCandles(true);

    fetchRealCandles(selectedSymbol, timeframe).then(data => {
      if (isMounted) {
        setCandles(data);
        setIsLoadingCandles(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, timeframe]);

  const indicators = computeTechnicalIndicators(selectedSymbol, currentStock.price);

  // FIXED: Standard calculation based on Previous Close for the selected timeframe
  const getDynamicChange = () => {
    // For the 1D view, rely on the backend's accurate prevClose quote
    if (timeframe === '1D') {
      return { change: currentStock.change, changePercent: currentStock.changePercent };
    }

    // For larger timeframes (1W, 1M, 1Y), calculate from the chart data
    if (!candles || candles.length === 0) {
      return { change: currentStock.change, changePercent: currentStock.changePercent };
    }
    
    // The true base is the Close of the FIRST candle in the timeframe
    const baseClose = candles[0].close;
    const lastClose = candles[candles.length - 1].close;
    
    const dynamicChange = lastClose - baseClose;
    const dynamicChangePercent = baseClose !== 0 ? (dynamicChange / baseClose) * 100 : 0;
    
    return { change: dynamicChange, changePercent: dynamicChangePercent };
  };

  const { change: dynamicChange, changePercent: dynamicChangePercent } = getDynamicChange();
  const isPositive = dynamicChangePercent >= 0;

  const timeframes: ('1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL')[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  const indicatorTabs: ('SMA' | 'RSI' | 'MACD' | 'Bollinger Bands')[] = ['SMA', 'RSI', 'MACD', 'Bollinger Bands'];

  const filteredSymbols = Object.keys(stocks).filter(s => 
    s.toLowerCase().includes(stockSearch.toLowerCase()) || 
    stocks[s]?.name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* View Header matching Collage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Market Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Explore stocks, charts and market indicators
          </p>
        </div>

        <button
          onClick={() => setActiveView('terminal')}
          className="self-start sm:self-auto px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trade {selectedSymbol}</span>
        </button>
      </div>

      {/* Official Indian Market Hours & Session Timeline */}
      <MarketTimeline />

      {/* Stock Search & Timeframe Bar matching Collage */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Search input with matching stocks quick picker */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Search stocks, symbols... (RELIANCE, TCS, INFY)"
            className="w-full pl-10 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
          />
        </div>

        {/* Stock Quick Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filteredSymbols.slice(0, 6).map(sym => {
            const isSelected = selectedSymbol === sym;
            return (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>

        {/* Timeframe Filter Pills [1D] [1W] [1M] [3M] [1Y] [ALL] */}
        <div className="flex p-0.5 bg-slate-100 rounded-xl self-end md:self-auto">
          {timeframes.map(tf => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Candlestick Chart (Left) + Key Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Candlestick Chart Card (8 cols) matching Collage */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          
          {/* Selected Stock Quote Header matching Collage */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900">
                  {selectedSymbol}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentStock.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold font-mono text-slate-900">
                  {currentStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {/* MODIFIED: Now uses dynamic change variables */}
                <span className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? '+' : ''}{dynamicChange.toFixed(2)} ({isPositive ? '+' : ''}{dynamicChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-mono">
              <div>NSE Equities Live</div>
              <div className="text-[11px] text-emerald-600 font-medium">{marketStatus.statusText}</div>
            </div>
          </div>

          {/* Interactive Candlestick Chart with Zoom, Pan, Volume */}
          <div className="min-h-[380px]">
            <CandlestickChart
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              activeIndicator={activeIndicatorTab}
              onIndicatorChange={setActiveIndicatorTab}
              height={380}
              showTimeframeSelector={false}
              allowZoom={true}
              symbol={selectedSymbol}
              stockName={currentStock.name}
            />
          </div>
        </div>

        {/* Key Stats Card (4 cols) matching Collage */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 mb-4">
              Key Stats
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Open</span>
                <span className="font-semibold text-slate-900">₹{currentStock.open.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">High</span>
                <span className="font-semibold text-emerald-600">₹{currentStock.high.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Low</span>
                <span className="font-semibold text-rose-600">₹{currentStock.low.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Prev Close</span>
                <span className="font-semibold text-slate-900">₹{currentStock.prevClose.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Volume</span>
                <span className="font-semibold text-slate-900">{currentStock.volumeFormatted || '12.4M'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">52W High</span>
                <span className="font-semibold text-slate-900">₹{currentStock.week52High.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">52W Low</span>
                <span className="font-semibold text-slate-900">₹{currentStock.week52Low.toFixed(2)}</span>
              </div>
            </div>

            {/* Day Range Progress Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-mono">
                <span>Low: ₹{currentStock.low.toFixed(0)}</span>
                <span className="font-bold text-slate-700">Day Range</span>
                <span>High: ₹{currentStock.high.toFixed(0)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((currentStock.price - currentStock.low) / (currentStock.high - currentStock.low || 1)) * 100))}%`
                  }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('terminal')}
            className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Open in Trading Terminal
          </button>
        </div>
      </div>

      {/* Technical Indicators Row matching Collage */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Technical Indicators</h3>
          
          {/* Tabs: [SMA] [RSI] [MACD] [Bollinger Bands] */}
          <div className="flex p-0.5 bg-slate-100 rounded-xl">
            {indicatorTabs.map(tab => {
              const isActive = activeIndicatorTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveIndicatorTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicator Value Tiles matching Collage */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">SMA (20)</div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              ₹{indicators.sma20.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">SMA (50)</div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              ₹{indicators.sma50.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">SMA (200)</div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              ₹{indicators.sma200.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="text-[11px] text-slate-500 font-medium">RSI (14)</div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-bold font-mono text-slate-900">
                {indicators.rsi14.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                indicators.rsiState === 'Overbought' 
                  ? 'bg-rose-100 text-rose-700' 
                  : indicators.rsiState === 'Oversold' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {indicators.rsiState}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="text-[11px] text-slate-500 font-medium">MACD (12, 26, 9)</div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-base font-bold font-mono text-slate-900">
                {indicators.macd.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                indicators.macdState === 'Bullish' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {indicators.macdState}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};