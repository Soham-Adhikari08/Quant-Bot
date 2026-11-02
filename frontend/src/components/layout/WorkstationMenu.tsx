import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Cpu, 
  Terminal, 
  Briefcase, 
  BarChart3, 
  History, 
  Settings,
  Sparkles, 
  Zap, 
  RotateCcw, 
  LogOut, 
  X, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { useTrading, ActiveView } from '../../context/TradingContext';
import { AppLogo } from '../common/AppLogo';

interface WorkstationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade?: () => void;
}

interface MenuModule {
  id: ActiveView;
  title: string;
  badge?: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'trading' | 'analytics' | 'account';
  shortcut?: string;
}

export const WorkstationMenu: React.FC<WorkstationMenuProps> = ({ 
  isOpen, 
  onClose,
  onOpenUpgrade 
}) => {
  const { 
    activeView, 
    setActiveView, 
    account, 
    marketStatus, 
    selectedSymbol, 
    currentStock, 
    simulationOverride, 
    setSimulationOverride, 
    startLoadingAnimation 
  } = useTrading();

  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const modules: MenuModule[] = [
    {
      id: 'dashboard',
      title: 'Main Dashboard',
      subtitle: 'Executive overview, portfolio valuation curve, top market movers & quick execution',
      badge: 'Home',
      icon: <LayoutDashboard className="w-5 h-5 text-emerald-600" />,
      category: 'trading',
      shortcut: '⌘1'
    },
    {
      id: 'market',
      title: 'Market Overview',
      subtitle: 'Technical candlestick pattern canvas with SMA, RSI, MACD & Bollinger overlays',
      badge: 'Live Data',
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      category: 'trading',
      shortcut: '⌘2'
    },
    {
      id: 'predictions',
      title: 'AI Prediction Centre',
      subtitle: 'Dual-model quantitative engine: Regression return + Directional classifier',
      badge: '87.5% Alpha',
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      category: 'trading',
      shortcut: '⌘3'
    },
    {
      id: 'terminal',
      title: 'Trading Terminal',
      subtitle: 'Order execution (Market, Limit, Stop-Loss, AMO) with pre-trade risk checks',
      badge: 'Execute',
      icon: <Terminal className="w-5 h-5 text-amber-600" />,
      category: 'trading',
      shortcut: '⌘4'
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Positions',
      subtitle: 'Real-time holdings, unrealised P&L, and SEBI cash vs equity asset allocation',
      badge: '₹1.02L Value',
      icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
      category: 'analytics',
      shortcut: '⌘5'
    },
    {
      id: 'models',
      title: 'Model Performance',
      subtitle: 'Algorithm calibration metrics: R² score, confusion matrix & benchmark alpha',
      badge: 'Audit',
      icon: <BarChart3 className="w-5 h-5 text-cyan-600" />,
      category: 'analytics',
      shortcut: '⌘6'
    },
    {
      id: 'history',
      title: 'Trade History Ledger',
      subtitle: 'Complete chronological execution audit log with timestamps & net returns',
      badge: 'Closed Logs',
      icon: <History className="w-5 h-5 text-indigo-600" />,
      category: 'analytics',
      shortcut: '⌘7'
    },
    {
      id: 'settings',
      title: 'Settings & Risk Profile',
      subtitle: 'SEBI KYC demat credentials, risk limits, stop-loss threshold & preferences',
      badge: 'Config',
      icon: <Settings className="w-5 h-5 text-slate-600" />,
      category: 'account',
      shortcut: '⌘8'
    }
  ];

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.subtitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.badge?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelect = (id: ActiveView) => {
    setActiveView(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative z-10 bg-white border border-slate-200 text-[#0F172A] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0F172A]">
                  Quant-Bot Navigation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  All Modules
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Direct access to all algorithmic trading features, analytics, and controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Filter Input */}
            <div className="relative hidden md:block w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter options..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close menu (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Strip: Active Stock & Market Status */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Selected Stock:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>{selectedSymbol}</span>
              <span className="text-slate-500 text-[11px] font-normal">₹{currentStock.price.toFixed(2)}</span>
              <span className={`text-[10px] font-bold ${currentStock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ({currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className={marketStatus.isOpen ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                {marketStatus.statusText}
              </span>
            </div>

            <button
              onClick={() => setSimulationOverride(!simulationOverride)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                simulationOverride 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {simulationOverride ? 'Sandbox ON' : 'Off-Hours Sandbox'}
            </button>
          </div>
        </div>

        {/* Body: All 8 Modules in a Clean Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredModules.map(mod => {
              const isActive = activeView === mod.id;
              return (
                <div
                  key={mod.id}
                  onClick={() => handleSelect(mod.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-3 relative ${
                    isActive
                      ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Left Icon + Text */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-slate-50 border-slate-200 group-hover:border-slate-300'
                    }`}>
                      {mod.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold truncate ${
                          isActive ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-600 transition-colors'
                        }`}>
                          {mod.title}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                        {mod.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Badges / Chevron */}
                  <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {mod.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick System Tools Row */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
              Quick Tools & Account Actions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Tool 1: Sandbox Simulation */}
              <button
                onClick={() => setSimulationOverride(!simulationOverride)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  simulationOverride 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className={`w-4 h-4 shrink-0 ${simulationOverride ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">Sandbox Mode</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {simulationOverride ? 'Active (Instant Fills)' : 'Real Exchange Rules'}
                    </div>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${simulationOverride ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              </button>

              {/* Tool 2: Replay 3s Intro Flow */}
              <button
                onClick={() => {
                  onClose();
                  startLoadingAnimation();
                }}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-left transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">Replay App Intro</div>
                  <div className="text-[10px] text-slate-500 truncate">Play Luma-style intro</div>
                </div>
              </button>

              {/* Tool 3: Upgrade Plan */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenUpgrade) onOpenUpgrade();
                }}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer flex items-center justify-between gap-2 group shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">Upgrade Plan</div>
                    <div className="text-[10px] text-slate-500 truncate">Quant-Bot Pro & Alpha</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bar: User Profile Summary & Sign Out */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {account.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{account.fullName || account.username}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                  {account.clientId}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Virtual Balance: <strong className="text-slate-900">₹{account.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveView('settings');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Preferences
            </button>

            <button
              onClick={() => {
                onClose();
                setActiveView('auth');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
