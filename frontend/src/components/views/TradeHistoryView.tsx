import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { ChevronDown, Download, Check, Calendar } from 'lucide-react';

export const TradeHistoryView: React.FC = () => {
  const { orders } = useTrading();
  const [stockFilter, setStockFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<string>('Last 30 Days');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const sampleHistoricalRows = [
    { id: 'h-1', timestamp: '11 Apr 10:24 AM', symbol: 'RELIANCE', type: 'BUY', quantity: 10, price: 2842.30, pnl: 420.00, status: 'Closed' },
    { id: 'h-2', timestamp: '10 Apr 02:17 PM', symbol: 'TCS', type: 'SELL', quantity: 5, price: 3860.10, pnl: 310.00, status: 'Closed' },
    { id: 'h-3', timestamp: '09 Apr 11:42 AM', symbol: 'INFY', type: 'BUY', quantity: 8, price: 1452.10, pnl: 210.00, status: 'Closed' },
    { id: 'h-4', timestamp: '08 Apr 01:32 PM', symbol: 'HDFCBANK', type: 'SELL', quantity: 5, price: 1670.20, pnl: 160.00, status: 'Closed' },
    { id: 'h-5', timestamp: '07 Apr 09:47 AM', symbol: 'RELIANCE', type: 'BUY', quantity: 10, price: 2800.10, pnl: -110.00, status: 'Closed' },
    { id: 'h-6', timestamp: '06 Apr 03:12 PM', symbol: 'TCS', type: 'BUY', quantity: 5, price: 3085.70, pnl: 320.00, status: 'Closed' },
  ];

  // Merge live user orders with collage rows
  const allOrders = [
    ...orders.map(o => ({
      id: o.id,
      timestamp: o.timestamp,
      symbol: o.symbol,
      type: o.type,
      quantity: o.quantity,
      price: o.price,
      pnl: o.pnl ?? 120.00,
      status: o.status === 'Queued (AMO)' ? 'Queued' : 'Closed'
    })),
    ...sampleHistoricalRows
  ];

  const filteredOrders = allOrders.filter(order => {
    if (stockFilter !== 'All' && order.symbol !== stockFilter) return false;
    if (typeFilter !== 'All' && order.type !== typeFilter) return false;
    return true;
  });

  const uniqueSymbols = Array.from(new Set(allOrders.map(o => o.symbol)));

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date & Time', 'Symbol', 'Type', 'Quantity', 'Price (INR)', 'P&L (INR)', 'Status'];
    const rows = filteredOrders.map(o => [
      o.id,
      `"${o.timestamp}"`,
      o.symbol,
      o.type,
      o.quantity,
      o.price.toFixed(2),
      o.pnl.toFixed(2),
      o.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quant_bot_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Filter Controls matching Collage */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Trade History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View all your past trades and performance
          </p>
        </div>

        {/* Filters Bar matching Collage */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stock Filter */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
            >
              <option value="All">All Stocks</option>
              {uniqueSymbols.map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
            >
              <option value="All">All Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Today">Today</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-slate-300" />}
            <span>{downloadSuccess ? 'Exported' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Table Card matching Collage */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <th className="pb-3.5">Date & Time</th>
                <th className="pb-3.5">Symbol</th>
                <th className="pb-3.5">Type</th>
                <th className="pb-3.5">Quantity</th>
                <th className="pb-3.5">Price</th>
                <th className="pb-3.5">P&L</th>
                <th className="pb-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredOrders.map((trade, idx) => {
                const isProfit = trade.pnl >= 0;
                return (
                  <tr key={trade.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 text-slate-500 font-sans">{trade.timestamp}</td>
                    <td className="py-3.5 font-bold text-slate-900">{trade.symbol}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        trade.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">{trade.quantity}</td>
                    <td className="py-3.5 font-semibold text-slate-900">₹{trade.price.toFixed(2)}</td>
                    <td className={`py-3.5 font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isProfit ? '+' : ''}₹{Math.abs(trade.pnl).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-sans font-medium">
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
