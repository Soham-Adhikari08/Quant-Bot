import React, { useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Briefcase, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Zap, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { PortfolioAreaChart, TIMEFRAME_PERFORMANCE } from '../common/PortfolioAreaChart';
import { MarketTimeline } from '../common/MarketTimeline';
import { STOCK_AI_SIGNALS } from '../../services/quantEngine';

export const DashboardView: React.FC = () => {
  const { 
    account, 
    totalPortfolioValue, 
    totalPnl, 
    totalPnlPercent, 
    holdings, 
    stocks, 
    selectedSymbol, 
    setSelectedSymbol,
    setActiveView 
  } = useTrading();

  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');

  const latestSignal = STOCK_AI_SIGNALS[selectedSymbol] || STOCK_AI_SIGNALS.RELIANCE;
  const currentStock = stocks[selectedSymbol] || stocks.RELIANCE;
  const longCount = holdings.filter(h => h.type === 'BUY').length;
  const shortCount = holdings.filter(h => h.type === 'SELL').length;

  const topGainers = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', changePercent: 2.81, points: [10, 15, 12, 19, 22, 28, 32] },
    { symbol: 'TCS', name: 'Tata Consultancy Services', changePercent: 2.21, points: [8, 11, 14, 13, 20, 24, 27] },
    { symbol: 'INFY', name: 'Infosys Ltd.', changePercent: 1.87, points: [12, 10, 15, 18, 16, 22, 25] },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', changePercent: 1.45, points: [5, 9, 8, 14, 17, 19, 21] },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', changePercent: 1.32, points: [6, 8, 12, 11, 15, 17, 18] },
  ];

  const currentPerf = TIMEFRAME_PERFORMANCE[timeframe] || TIMEFRAME_PERFORMANCE['1D'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Greeting matching Panel 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Good Morning, {account.username || 'Trader'}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Let's make smarter trades today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Paper Trading Mode
          </span>
        </div>
      </div>

      {/* Indian Equity Market Open/Close Timeline */}
      <MarketTimeline />

      {/* Row 1: 4 Metric Cards matching Panel 3 & Collage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Virtual Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>Virtual Balance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ₹{account.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Available paper capital
          </div>
        </div>

        {/* Metric 2: Total P&L */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>Total P&L</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
            +₹{totalPnl >= 0 ? totalPnl.toLocaleString('en-IN') : '2,450'}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span>+{totalPnlPercent > 0 ? totalPnlPercent.toFixed(2) : '2.45'}%</span>
            <span className="text-slate-400 font-normal">all time</span>
          </div>
        </div>

        {/* Metric 3: Active Positions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>Active Positions</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {holdings.length || 4}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {longCount || 2} Long | {shortCount || 2} Short
          </div>
        </div>

        {/* Metric 4: AI Confidence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>AI Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            87.5%
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">
            High Confidence Alpha
          </div>
        </div>
      </div>

      {/* Row 2: Middle Grid - Portfolio Value Chart (Left) + AI Trading Signal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Portfolio Value Card (8 cols) matching Panel 3 */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Portfolio Value
              </span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  ₹{currentPerf.endValue.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +{currentPerf.gainPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Area Chart with Stock Market Timeline & Portfolio Toggle */}
          <PortfolioAreaChart 
            timeframe={timeframe} 
            onTimeframeChange={setTimeframe} 
            selectedSymbol={selectedSymbol}
            stockPrice={currentStock.price}
          />
        </div>

        {/* AI Trading Signal Card (4 cols) matching Panel 3 */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">AI Trading Signal</h3>
              </div>
              <button
                onClick={() => setActiveView('predictions')}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Open AI Predictions"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Target Stock + Buy Badge */}
            <div className="my-5 flex items-center justify-between">
              <div>
                <span className="text-xl font-extrabold text-slate-900 font-mono">
                  {selectedSymbol}
                </span>
                <div className="text-xs text-slate-500 font-medium">
                  Confidence: {latestSignal.confidence}%
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                latestSignal.decision === 'BUY' 
                  ? 'bg-emerald-600 text-white' 
                  : latestSignal.decision === 'SELL' 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-amber-500 text-white'
              }`}>
                {latestSignal.decision}
              </span>
            </div>

            {/* Model Breakdown Checklist from Flow */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Regression (Return)</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">
                  +{latestSignal.regressionReturn}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Classification (Prob.)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {latestSignal.classificationProb.up}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fusion Engine</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">
                  {latestSignal.decision}
                </span>
              </div>
            </div>
          </div>

          {/* View Details -> Button */}
          <button
            onClick={() => setActiveView('terminal')}
            className="w-full mt-4 py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Row 3: Bottom Grid - Top Gainers (Left) + Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Gainers Card (7 cols) matching Panel 3 */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Top Gainers</h3>
            <button
              onClick={() => setActiveView('market')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topGainers.map(stock => {
              const live = stocks[stock.symbol];
              const price = live?.price || (stock.symbol === 'RELIANCE' ? 2842.30 : stock.symbol === 'TCS' ? 3912.45 : 1452.10);
              
              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    setSelectedSymbol(stock.symbol);
                    setActiveView('terminal');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-28 sm:w-36">
                    <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-600 transition-colors">
                      {stock.symbol}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      ₹{price.toFixed(2)}
                    </div>
                  </div>

                  {/* Mini SVG Sparkline matching Panel 3 */}
                  <div className="w-24 sm:w-32 h-6 flex items-center">
                    <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
                      <path
                        d={`M 0 ${24 - stock.points[0]} L 16 ${24 - stock.points[1]} L 32 ${24 - stock.points[2]} L 48 ${24 - stock.points[3]} L 64 ${24 - stock.points[4]} L 80 ${24 - stock.points[5]} L 100 ${24 - stock.points[6]}`}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Change Percent Badge */}
                  <div className="font-mono font-bold text-xs text-emerald-600 w-16 text-right">
                    +{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Card (5 cols) matching Panel 3 */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Tile 1: Explore Markets */}
              <button
                onClick={() => setActiveView('market')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center mb-2 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Explore Markets</span>
              </button>

              {/* Tile 2: View Portfolio */}
              <button
                onClick={() => setActiveView('portfolio')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center mb-2 transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800">View Portfolio</span>
              </button>

              {/* Tile 3: Check Performance */}
              <button
                onClick={() => setActiveView('models')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center mb-2 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Check Performance</span>
              </button>

              {/* Tile 4: Trade Now */}
              <button
                onClick={() => setActiveView('terminal')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center mb-2 transition-colors">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Trade Now</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SEBI Demat Paper Gateway</span>
            <span className="font-mono text-emerald-600">Zero Slippage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
