import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Layers, BarChart2 } from 'lucide-react';
import { CandleData } from '../../types/trading';
import { fetchRealCandles } from '../../services/marketData';

export interface TimeframePerformance {
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  startValue: number;
  endValue: number;
  gainAmount: number;
  gainPercent: number;
  label: string;
}

export const TIMEFRAME_PERFORMANCE: Record<string, TimeframePerformance> = {
  '1D': { timeframe: '1D', startValue: 100000, endValue: 102450, gainAmount: 2450, gainPercent: 2.45, label: 'Intraday 1D' },
  '1W': { timeframe: '1W', startValue: 97800, endValue: 102450, gainAmount: 4650, gainPercent: 4.75, label: '1 Week' },
  '1M': { timeframe: '1M', startValue: 92400, endValue: 102450, gainAmount: 10050, gainPercent: 10.88, label: '1 Month' },
  '3M': { timeframe: '3M', startValue: 84200, endValue: 102450, gainAmount: 18250, gainPercent: 21.67, label: '3 Months' },
  '1Y': { timeframe: '1Y', startValue: 71200, endValue: 102450, gainAmount: 31250, gainPercent: 43.89, label: '1 Year' },
  'ALL': { timeframe: 'ALL', startValue: 52000, endValue: 102450, gainAmount: 50450, gainPercent: 97.02, label: 'All Time' }
};

interface PortfolioAreaChartProps {
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  onTimeframeChange: (tf: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL') => void;
  selectedSymbol?: string;
  stockPrice?: number;
}

export const PortfolioAreaChart: React.FC<PortfolioAreaChartProps> = ({
  timeframe,
  onTimeframeChange,
  selectedSymbol = 'RELIANCE',
  stockPrice = 1164.90
}) => {
  const [viewMode, setViewMode] = useState<'stock' | 'portfolio'>('stock');
  const [hoverPoint, setHoverPoint] = useState<{ val: number; date: string; x: number; y: number; changeFromStart: number } | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch real candles for the selected stock across the selected timeframe
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchRealCandles(selectedSymbol, timeframe).then(data => {
      if (isMounted) {
        setCandles(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, timeframe]);

  const portfolioPerf = TIMEFRAME_PERFORMANCE[timeframe] || TIMEFRAME_PERFORMANCE['1D'];

  // Stock Significant Change calculation from real candles
  const stockStats = useMemo(() => {
    if (!candles || candles.length === 0) {
      return {
        startPrice: stockPrice * 0.98,
        endPrice: stockPrice,
        change: stockPrice * 0.02,
        changePercent: 2.0,
        isProfit: true,
        periodHigh: stockPrice * 1.03,
        periodLow: stockPrice * 0.97
      };
    }

    const startPrice = candles[0].close || candles[0].open;
    const endPrice = candles[candles.length - 1].close;
    const change = Number((endPrice - startPrice).toFixed(2));
    const changePercent = Number(((change / startPrice) * 100).toFixed(2));
    const isProfit = change >= 0;

    let periodHigh = -Infinity;
    let periodLow = Infinity;
    candles.forEach(c => {
      if (c.high > periodHigh) periodHigh = c.high;
      if (c.low < periodLow) periodLow = c.low;
    });

    return {
      startPrice,
      endPrice,
      change,
      changePercent,
      isProfit,
      periodHigh: periodHigh === -Infinity ? endPrice : periodHigh,
      periodLow: periodLow === Infinity ? endPrice : periodLow
    };
  }, [candles, stockPrice]);

  // Derive points for chart
  const points = useMemo(() => {
    if (viewMode === 'stock' && candles && candles.length > 0) {
      const startPrice = candles[0].close || candles[0].open;
      return candles.map((c, i) => {
        return {
          x: (i / (candles.length - 1 || 1)) * 600,
          y: c.close,
          val: c.close,
          label: c.time,
          changeFromStart: Number((c.close - startPrice).toFixed(2))
        };
      });
    }

    // Portfolio simulated curve
    const count = 30;
    const pts: { x: number; y: number; val: number; label: string; changeFromStart: number }[] = [];
    const getLabel = (idx: number) => {
      if (timeframe === '1D') {
        const totalMinutes = 375;
        const minPast = Math.floor((idx / (count - 1)) * totalMinutes);
        const hours = 9 + Math.floor((15 + minPast) / 60);
        const mins = ((15 + minPast) % 60).toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours > 12 ? hours - 12 : hours;
        return `${displayHour}:${mins} ${ampm}`;
      } else if (timeframe === '1W') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        return days[Math.floor((idx / count) * 5)];
      } else if (timeframe === '1M') {
        return `Day ${Math.max(1, Math.round((idx / count) * 30))}`;
      } else if (timeframe === '1Y') {
        const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
        return months[Math.floor((idx / count) * 6)] || 'Dec';
      } else {
        return `Year ${2024 + Math.floor((idx / count) * 3)}`;
      }
    };

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const trend = portfolioPerf.startValue + progress * portfolioPerf.gainAmount;
      const wave = Math.sin(progress * 7) * (portfolioPerf.gainAmount * 0.12) + Math.cos(progress * 4) * (portfolioPerf.gainAmount * 0.06);
      const val = Math.round(trend + (i === count - 1 ? 0 : wave));

      pts.push({
        x: (i / (count - 1)) * 600,
        y: val,
        val: i === count - 1 ? portfolioPerf.endValue : val,
        label: getLabel(i),
        changeFromStart: val - portfolioPerf.startValue
      });
    }
    return pts;
  }, [viewMode, candles, timeframe, portfolioPerf]);

  const min = Math.min(...points.map(p => p.val));
  const max = Math.max(...points.map(p => p.val));
  const range = max - min || 1;
  const height = 190;

  const isNetProfit = viewMode === 'stock' ? stockStats.isProfit : true;
  const themeStroke = isNetProfit ? '#10B981' : '#E11D48';
  const themeFillId = isNetProfit ? 'emeraldAreaGradient' : 'roseAreaGradient';

  const normalizedPoints = points.map(p => ({
    ...p,
    normalizedY: height - 30 - ((p.val - min) / range) * (height - 60)
  }));

  const pathD = normalizedPoints.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.normalizedY}`;
    const prev = arr[idx - 1];
    const cx = (prev.x + curr.x) / 2;
    return `${acc} C ${cx} ${prev.normalizedY}, ${cx} ${curr.normalizedY}, ${curr.x} ${curr.normalizedY}`;
  }, '');

  const areaD = normalizedPoints.length > 0 
    ? `${pathD} L ${normalizedPoints[normalizedPoints.length - 1].x} ${height - 10} L ${normalizedPoints[0].x} ${height - 10} Z`
    : '';

  const timeframes: ('1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL')[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  return (
    <div className="w-full">
      {/* Mode Switcher + Timeframe bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        {/* Toggle Mode: Stock Market Timeline vs Total Portfolio */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('stock')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'stock'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{selectedSymbol} P&L ({timeframe})</span>
          </button>

          <button
            onClick={() => setViewMode('portfolio')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'portfolio'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            <span>Portfolio Growth</span>
          </button>
        </div>

        {/* Timeframe pill selector: [1D] [1W] [1M] [3M] [1Y] [ALL] */}
        <div className="flex p-0.5 bg-slate-100 rounded-xl self-end sm:self-auto">
          {timeframes.map(tf => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
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

      {/* Significant Change Stat Banner (Shows how much loss or profit the market is in for this stock) */}
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isNetProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {isNetProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>

          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              {viewMode === 'stock' ? `${selectedSymbol} · ${timeframe} Market Change` : `Portfolio · ${timeframe} Performance`}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-lg font-extrabold font-mono ${isNetProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {viewMode === 'stock' ? (
                  <>
                    {stockStats.change >= 0 ? '+' : ''}₹{stockStats.change.toFixed(2)} ({stockStats.changePercent >= 0 ? '+' : ''}{stockStats.changePercent.toFixed(2)}%)
                  </>
                ) : (
                  <>
                    +₹{portfolioPerf.gainAmount.toLocaleString('en-IN')} (+{portfolioPerf.gainPercent}%)
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {isNetProfit ? 'Net Market Profit' : 'Net Market Loss'}
              </span>
            </div>
          </div>
        </div>

        {/* Period High / Low Info */}
        {viewMode === 'stock' && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">Period Low</span>
              <span className="font-bold text-rose-600">₹{stockStats.periodLow.toFixed(2)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">Period High</span>
              <span className="font-bold text-emerald-600">₹{stockStats.periodHigh.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full h-[200px]">
        <svg
          viewBox={`0 0 600 ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="roseAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E11D48" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height - 30} x2="600" y2={height - 30} stroke="#E2E8F0" strokeWidth="1" />
          <line x1="0" y1={height / 2} x2="600" y2={height / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

          {/* Shaded Area */}
          <path d={areaD} fill={`url(#${themeFillId})`} />

          {/* Main Line */}
          <path
            d={pathD}
            fill="none"
            stroke={themeStroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover overlay regions */}
          {normalizedPoints.map((pt, idx) => (
            <rect
              key={idx}
              x={Math.max(0, pt.x - 10)}
              y={0}
              width={20}
              height={height}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverPoint({ 
                val: pt.val, 
                date: pt.label, 
                x: pt.x, 
                y: pt.normalizedY,
                changeFromStart: pt.changeFromStart
              })}
            />
          ))}

          {/* Hover indicator dot */}
          {hoverPoint && (
            <g>
              <line
                x1={hoverPoint.x}
                y1={10}
                x2={hoverPoint.x}
                y2={height - 30}
                stroke="#0F172A"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r="5"
                fill={themeStroke}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {hoverPoint && (
          <div
            className="absolute z-20 -top-4 pointer-events-none transform -translate-x-1/2 bg-[#0F172A] text-white px-3 py-1.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700"
            style={{ left: `${(hoverPoint.x / 600) * 100}%` }}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>₹{hoverPoint.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`text-[10px] ${hoverPoint.changeFromStart >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({hoverPoint.changeFromStart >= 0 ? '+' : ''}₹{hoverPoint.changeFromStart.toFixed(2)})
              </span>
            </div>
            <div className="text-[10px] text-slate-300">{hoverPoint.date}</div>
          </div>
        )}
      </div>

      {/* X-axis Timestamps matching real period */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
        <span>{points[0]?.label || '09:15 AM'}</span>
        <span>{points[Math.floor(points.length / 3)]?.label || '11:30 AM'}</span>
        <span>{points[Math.floor((points.length * 2) / 3)]?.label || '01:30 PM'}</span>
        <span>{points[points.length - 1]?.label || '03:30 PM'}</span>
      </div>
    </div>
  );
};
