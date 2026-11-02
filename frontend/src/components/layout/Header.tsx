import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  LogIn, 
  Menu, 
  Check, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const Header: React.FC = () => {
  const { 
    selectedSymbol, 
    setSelectedSymbol, 
    stocks, 
    activeView, 
    setActiveView, 
    startLoadingAnimation,
    account,
    marketStatus,
    setIsMobileMenuOpen,
    setIsWorkstationMenuOpen
  } = useTrading();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const availableSymbols = Object.keys(stocks);
  const filteredSymbols = availableSymbols.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stocks[s]?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  const sampleNotifications = [
    {
      id: 'notif-1',
      title: 'RELIANCE Breakout Signal Triggered',
      desc: 'Dual-model fusion AI generated strong BUY with 87.5% confidence above ₹2,840.',
      time: '2 mins ago',
      type: 'buy'
    },
    {
      id: 'notif-2',
      title: 'Stop Loss Guardrail Active',
      desc: 'Risk matrix calibrated for INFY position: Max drawdown capped at 2.5%.',
      time: '18 mins ago',
      type: 'info'
    },
    {
      id: 'notif-3',
      title: 'NSE Market Session Update',
      desc: marketStatus.isOpen 
        ? 'NSE Equities live trading session in progress.' 
        : 'NSE market is currently closed. Weekend/Off-hours replay active.',
      time: '1 hour ago',
      type: 'market'
    }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-20 shrink-0">
      
      {/* Left: Mobile Drawer Button + Search Input matching reference */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile-only menu toggle (Desktop uses clean left sidebar navigation) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer shrink-0"
          title="Open Navigation"
        >
          <Menu className="w-4 h-4 text-slate-700" />
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search stocks, symbols... (RELIANCE, TCS, INFY)"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchTerm && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsSearchOpen(false)} 
              />
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 max-h-72 overflow-y-auto p-1.5">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Matching Indian Equities ({filteredSymbols.length})
                </div>
                {filteredSymbols.length > 0 ? (
                  filteredSymbols.map(sym => {
                    const st = stocks[sym];
                    const isSelected = selectedSymbol === sym;
                    const isPositive = (st?.changePercent || 0) >= 0;
                    return (
                      <button
                        key={sym}
                        onClick={() => handleSelectSymbol(sym)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isSelected ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{sym}</span>
                            <span className="text-[10px] text-slate-400 font-normal">NSE</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">
                            {st?.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold text-slate-900">
                            ₹{st?.price.toFixed(2)}
                          </div>
                          <div className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? '+' : ''}{st?.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching stocks found for "{searchTerm}"
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Paper Trading Badge + Notification Bell + User Avatar + Replay Flow */}
      <div className="flex items-center gap-3">
        {/* Paper Trading Mode Badge matching Flow & Collage */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Paper Trading Mode</span>
        </div>

        {/* Replay 3s Intro Flow button */}
        <button
          onClick={startLoadingAnimation}
          title="Replay 3-second Intro Flow"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Intro</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadNotifications(0);
            }}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-xs">Market & Algo Alerts</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Live</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {sampleNotifications.map(n => (
                    <div 
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.type === 'buy') setActiveView('terminal');
                      }}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-0.5">
                        <span className="truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-1 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveView('predictions');
                    }}
                    className="text-xs text-emerald-600 hover:underline font-semibold"
                  >
                    View All AI Signals &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar Circle "T" matching Flow Panel 3 */}
        <button
          onClick={() => setActiveView('settings')}
          className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 hover:ring-emerald-500 transition-all cursor-pointer shadow-sm"
          title="Account Settings"
        >
          {account.username.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
};
