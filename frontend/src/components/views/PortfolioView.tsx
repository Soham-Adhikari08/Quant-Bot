import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus, 
  BarChart2, 
  PieChart, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { DonutChart } from '../common/DonutChart';

export const PortfolioView: React.FC = () => {
  const { 
    holdings, 
    stocks, 
    account, 
    totalPortfolioValue, 
    investedAmount, 
    totalPnl, 
    totalPnlPercent, 
    realisedPnl, 
    unrealisedPnl, 
    cashBalance, 
    setSelectedSymbol, 
    setActiveView 
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'Holdings' | 'Positions' | 'P&L Analysis'>('Holdings');

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header matching Collage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Portfolio
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track your virtual investments and performance
          </p>
        </div>

        <button
          onClick={() => setActiveView('terminal')}
          className="self-start sm:self-auto px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Position</span>
        </button>
      </div>

      {/* 5 Summary KPI Cards matching Collage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Value</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
            +{totalPnlPercent > 0 ? totalPnlPercent.toFixed(2) : '2.45'}%
          </div>
        </div>

        {/* Card 2: Invested Amount */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Invested Amount</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            4 assets deployed
          </div>
        </div>

        {/* Card 3: Realised P&L */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Realised P&L</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            +₹{realisedPnl > 0 ? realisedPnl.toLocaleString('en-IN') : '2,450'}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Settled paper gains
          </div>
        </div>

        {/* Card 4: Unrealised P&L */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Unrealised P&L</div>
          <div className={`text-xl font-bold font-mono mt-1 ${unrealisedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {unrealisedPnl >= 0 ? '+' : ''}₹{unrealisedPnl.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Live open mark-to-market
          </div>
        </div>

        {/* Card 5: Cash Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Cash Balance</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{account.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Available margin
          </div>
        </div>
      </div>

      {/* Tabs: [Holdings] [Positions] [P&L Analysis] matching Collage */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs overflow-x-auto">
        {(['Holdings', 'Positions', 'P&L Analysis'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-semibold transition-all cursor-pointer border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Holdings Table (8 cols) + Asset Allocation (4 cols) matching Collage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table Area (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            {activeTab === 'Holdings' ? 'Active Holdings' : activeTab === 'Positions' ? 'Open Positions' : 'Cumulative P&L'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Avg. Price</th>
                  <th className="pb-3">LTP</th>
                  <th className="pb-3">Market Value</th>
                  <th className="pb-3 text-right">P&L %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {holdings.map(pos => {
                  const stock = stocks[pos.symbol];
                  const ltp = stock?.price || pos.currentPrice || 2842.30;
                  const marketVal = pos.quantity * ltp;
                  const pnl = marketVal - (pos.quantity * pos.avgPrice);
                  const pnlPct = ((ltp - pos.avgPrice) / pos.avgPrice) * 100;
                  const isPos = pnl >= 0;

                  return (
                    <tr 
                      key={pos.id}
                      onClick={() => {
                        setSelectedSymbol(pos.symbol);
                        setActiveView('terminal');
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {pos.symbol}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                          {pos.name}
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-700">{pos.quantity}</td>
                      <td className="py-3.5 text-slate-700">₹{pos.avgPrice.toFixed(2)}</td>
                      <td className="py-3.5 font-bold text-slate-900">₹{ltp.toFixed(2)}</td>
                      <td className="py-3.5 text-slate-900">₹{marketVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`py-3.5 text-right font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPos ? '+' : ''}{pnlPct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Allocation Donut Card (4 cols) matching Collage */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full">
            <h3 className="font-bold text-slate-900 text-sm mb-4 pb-3 border-b border-slate-100">
              Asset Allocation
            </h3>
            
            <DonutChart totalValue={totalPortfolioValue} />
          </div>

          <button
            onClick={() => setActiveView('terminal')}
            className="w-full mt-6 py-2.5 bg-slate-100 hover:bg-[#0F172A] hover:text-white text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Rebalance Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
