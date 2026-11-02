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
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  RotateCcw,
  X,
  Check
} from 'lucide-react';
import { useTrading, ActiveView } from '../../context/TradingContext';
import { AppLogo } from '../common/AppLogo';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    account, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    startLoadingAnimation 
  } = useTrading();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'quant'>('quant');
  const [upgraded, setUpgraded] = useState(false);

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'market', label: 'Markets', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'predictions', label: 'AI Predictions', icon: <Cpu className="w-4 h-4" /> },
    { id: 'terminal', label: 'Trading Terminal', icon: <Terminal className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'models', label: 'Model Performance', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'history', label: 'Trade History', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleSignOut = () => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    setActiveView('auth');
  };

  const sidebarContent = (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-300 h-full">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <AppLogo size="sm" />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                Quant-Bot
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-mono mt-1">
                Paper Trading Mode
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list matching Flow & Collage */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {/* Active Indicator on the left edge */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Promo Card + User Profile Pill */}
      <div className="p-3 space-y-3">
        {/* Smarter Trades. Better Returns. [Upgrade Plan] Card (Matching Flow & Collage) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-800 text-center relative overflow-hidden group shadow-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-white leading-tight">
            Smarter Trades.
          </p>
          <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
            Better Returns.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
          >
            Upgrade Plan
          </button>
        </div>

        {/* User Profile Pill matching Flow: Avatar, Trader_07, caret */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-emerald-500/40">
                {account.username.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {account.username || 'Trader_07'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {account.clientId || 'QB884102'}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl py-1 z-30 text-xs">
              <button
                onClick={() => handleNavClick('settings')}
                className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setIsMobileMenuOpen(false);
                  startLoadingAnimation();
                }}
                className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Replay 3s Intro Flow</span>
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={handleSignOut}
                className="w-full px-3 py-2 text-left text-rose-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full w-64 max-w-[80vw] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Interactive Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Upgrade to Quant-Bot Pro</h3>
                  <p className="text-xs text-slate-500">Institutional level low-latency AI signals</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setUpgraded(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {upgraded ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Institutional Plan Activated!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your sandbox now has access to real-time tick-level XGBoost calibration, unlimited F&O paper capital, and automated stop-loss guardrails.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-6 py-2.5 bg-[#0F172A] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Return to Terminal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan('pro')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === 'pro'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600">Pro Trader</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">₹1,999<span className="text-xs font-normal text-slate-500">/mo</span></div>
                    <ul className="text-[11px] text-slate-500 mt-3 space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 1-min AI Signal updates</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 20 Indian Stock watchlist</li>
                    </ul>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('quant')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      selectedPlan === 'quant'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-[9px] font-bold text-white uppercase tracking-wider">
                      Popular
                    </span>
                    <div className="text-xs font-semibold text-slate-600">Institutional Quant</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">₹4,999<span className="text-xs font-normal text-slate-500">/mo</span></div>
                    <ul className="text-[11px] text-slate-500 mt-3 space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Tick-level XGBoost fusion</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Automated Risk Management</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day Money-Back Guarantee. Simulated SEBI paper broker account included.</span>
                </div>

                <button
                  onClick={() => setUpgraded(true)}
                  className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Activate {selectedPlan === 'quant' ? 'Institutional Quant' : 'Pro Trader'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
