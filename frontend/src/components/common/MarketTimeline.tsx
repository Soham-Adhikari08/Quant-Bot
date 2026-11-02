import React from 'react';
import { 
  Clock, 
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

interface MarketTimelineProps {
  compact?: boolean;
  showDetails?: boolean;
}

export const MarketTimeline: React.FC<MarketTimelineProps> = ({ 
  compact = false,
  showDetails = true
}) => {
  const { marketStatus, simulationOverride, setSimulationOverride } = useTrading();

  const isClosed = !marketStatus.isOpen;

  // Exact real-time IST timeline percentage across 09:00 - 16:00 IST
  const timelinePct = typeof marketStatus.timelineProgressPercent === 'number'
    ? marketStatus.timelineProgressPercent
    : marketStatus.sessionProgressPercent;

  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs font-sans">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${marketStatus.isOpen ? 'text-emerald-700' : 'text-slate-800'}`}>
                {marketStatus.statusText}
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {marketStatus.istTime}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {marketStatus.timeRemainingText}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClosed && (
            <button
              onClick={() => setSimulationOverride(!simulationOverride)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                simulationOverride 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {simulationOverride ? 'Sandbox ON' : 'Off-Market Sandbox'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs font-sans space-y-4">
      {/* Top Row: Market Status Header + Live IST Clock + Feed Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
            marketStatus.isOpen 
              ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse' 
              : marketStatus.phase === 'PRE_OPEN'
              ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
              : 'bg-slate-400 ring-4 ring-slate-100'
          }`} />
          
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm sm:text-base font-extrabold ${
                marketStatus.isOpen ? 'text-emerald-700' : 'text-slate-900'
              }`}>
                NSE / BSE: {marketStatus.statusText}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                marketStatus.isOpen 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : marketStatus.phase === 'PRE_OPEN'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {marketStatus.phaseLabel}
              </span>
            </div>
            
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{marketStatus.istDate}</span>
              <span className="text-slate-300">·</span>
              <span className="font-bold text-slate-800">{marketStatus.istTime}</span>
            </div>
          </div>
        </div>

        {/* Real Data Live Badge + Countdown Timer */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Real NSE Live Feed</span>
          </div>

          <div className="px-3 py-1.5 bg-[#0F172A] text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{marketStatus.timeRemainingText}</span>
          </div>
        </div>
      </div>

      {/* Visual Market Session Timeline Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-700">Official Indian Trading Session Timeline (IST)</span>
          <span className="font-mono text-slate-700 font-bold">
            {marketStatus.isOpen ? `${Math.round(timelinePct)}% of trading day completed` : marketStatus.nextSessionText}
          </span>
        </div>

        {/* Timeline Graphic Bar Container with Decluttered Staggered Milestones */}
        <div className="relative pt-12 pb-12 px-1 select-none">
          {/* Base track */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
            {/* Live Progress Fill synchronized across 09:00 - 16:00 IST */}
            {timelinePct > 0 && (
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${timelinePct}%` }}
              />
            )}
            {/* If fully closed or weekend */}
            {timelinePct <= 0 && (
              <div className="h-full bg-slate-200 w-full" />
            )}
          </div>

          {/* Real-Time Glowing IST Indicator Pin positioned on the progress bar */}
          {timelinePct > 0 && timelinePct < 100 && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 transition-all duration-1000 ease-linear"
              style={{ left: `${Math.max(3, Math.min(97, timelinePct))}%` }}
            >
              {/* Floating Live Badge elevated above pin */}
              <div className="px-2.5 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px] font-mono font-bold shadow-lg whitespace-nowrap flex items-center gap-1.5 -translate-y-8 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{marketStatus.istTime.split(' ')[0]}</span>
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">LIVE IST</span>
              </div>

              {/* Glowing Center Beacon on the track */}
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md ring-4 ring-emerald-200/80 animate-pulse" />
            </div>
          )}

          {/* Milestone Nodes & Staggered Labels (Alternating Above / Below Track) */}
          {marketStatus.timelineEvents.map((evt, idx) => {
            const pct = typeof evt.percentage === 'number' 
              ? evt.percentage 
              : (idx / (marketStatus.timelineEvents.length - 1)) * 100;
            
            // Alternating: Even indices (09:00, 11:30, 15:30) above; Odd indices (09:15, 13:30, 16:00) below
            const isAbove = idx % 2 === 0;

            // Smart collision spacing & edge clamping for label containers
            const alignClass = pct <= 1 
              ? 'items-start translate-x-0 text-left' 
              : pct < 10 
              ? 'items-start translate-x-0 text-left'
              : pct >= 99 
              ? 'items-end -translate-x-full text-right' 
              : pct > 90
              ? 'items-end -translate-x-full text-right'
              : 'items-center -translate-x-1/2 text-center';

            // Tick alignment relative to the node dot (which is centered at left: pct%)
            const tickAlignClass = pct <= 1 || pct < 10
              ? 'self-start ml-[5px]'
              : pct >= 99 || pct > 90
              ? 'self-end mr-[5px]'
              : 'self-center';

            return (
              <div 
                key={evt.time}
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{ left: `${pct}%` }}
              >
                {/* Milestone Node Dot on the track line */}
                <div className={`w-3.5 h-3.5 -translate-x-1/2 rounded-full border-2 transition-all shadow-xs ${
                  evt.passed 
                    ? 'bg-[#0F172A] border-white ring-2 ring-[#0F172A]/20' 
                    : 'bg-white border-slate-300'
                }`} />

                {/* Staggered Label: Positioned Above or Below with directional connecting tick */}
                {isAbove ? (
                  <div className={`absolute bottom-full mb-1 flex flex-col ${alignClass} pointer-events-auto`}>
                    <span className={`font-mono font-bold text-[11px] leading-tight whitespace-nowrap ${
                      evt.passed ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {evt.time}
                    </span>
                    <span className={`text-[10px] font-sans leading-tight whitespace-nowrap ${
                      evt.passed ? 'text-slate-700 font-semibold' : 'text-slate-400'
                    }`}>
                      {evt.label}
                    </span>
                    {/* Connecting vertical tick pointing down to the dot */}
                    <div className={`w-0.5 h-2 mt-1 rounded-full ${evt.passed ? 'bg-slate-700' : 'bg-slate-300'} ${tickAlignClass}`} />
                  </div>
                ) : (
                  <div className={`absolute top-full mt-1 flex flex-col ${alignClass} pointer-events-auto`}>
                    {/* Connecting vertical tick pointing up to the dot */}
                    <div className={`w-0.5 h-2 mb-1 rounded-full ${evt.passed ? 'bg-slate-700' : 'bg-slate-300'} ${tickAlignClass}`} />
                    <span className={`font-mono font-bold text-[11px] leading-tight whitespace-nowrap ${
                      evt.passed ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {evt.time}
                    </span>
                    <span className={`text-[10px] font-sans leading-tight whitespace-nowrap ${
                      evt.passed ? 'text-slate-700 font-semibold' : 'text-slate-400'
                    }`}>
                      {evt.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Off-Hours / Closed Notice & Simulation Sandbox Controls */}
      {showDetails && (
        <div className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          isClosed 
            ? 'bg-amber-50/60 border-amber-200 text-amber-950' 
            : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-start gap-2.5">
            <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isClosed ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div>
              {isClosed ? (
                <div>
                  <span className="font-bold text-amber-900">Exchange is currently closed ({marketStatus.istDate}). </span>
                  <span className="text-amber-800">
                    Live Indian market opens at <strong>09:15 AM IST ({marketStatus.nextSessionText})</strong>. Orders placed will be queued as <strong>After Market Orders (AMO)</strong>, or you can enable <strong>Sandbox Simulation</strong> for immediate practice fills.
                  </span>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-emerald-900">Live Continuous Trading Session Active. </span>
                  <span className="text-emerald-800">
                    Executing real-time simulated fills matching live NSE quotes with SEBI risk rules.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sandbox Simulation Mode Toggle Button */}
          {isClosed && (
            <button
              onClick={() => setSimulationOverride(!simulationOverride)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                simulationOverride 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              {simulationOverride ? 'Sandbox Simulation: ON' : 'Enable Off-Hours Trading'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
