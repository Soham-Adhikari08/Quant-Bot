import React from 'react';
import { useTrading } from '../../context/TradingContext';

export const Footer: React.FC = () => {
  const { account, marketStatus, simulationOverride } = useTrading();

  return (
    <footer className="h-10 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 z-10 shrink-0 font-mono">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-900">Quant-Bot</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">NSE National Stock Exchange</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className={`font-semibold ${marketStatus.isOpen ? 'text-emerald-700' : 'text-slate-600'}`}>
            {marketStatus.statusText}
          </span>
          <span className="text-slate-400 hidden sm:inline">({marketStatus.istTime})</span>
          <span className="text-slate-500 font-bold hidden lg:inline">· {marketStatus.timeRemainingText}</span>
        </div>

        {simulationOverride && (
          <span className="hidden sm:inline bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
            Off-Market Sandbox Active
          </span>
        )}

        <span className="text-slate-300">·</span>
        <span className="text-slate-500">
          Paper Balance: <strong className="font-mono text-slate-900 tabular-nums font-bold">₹{account.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </span>
      </div>
    </footer>
  );
};
