import React from 'react';
import { TradingProvider, useTrading, ActiveView } from './context/TradingContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WorkstationMenu } from './components/layout/WorkstationMenu';

import { AuthView } from './components/views/AuthView';
import { LoadingAnimation } from './components/common/LoadingAnimation';
import { InsufficientFundsModal } from './components/common/InsufficientFundsModal';
import { MarketClosedModal } from './components/common/MarketClosedModal';
import { DashboardView } from './components/views/DashboardView';
import { MarketOverviewView } from './components/views/MarketOverviewView';
import { AIPredictionsView } from './components/views/AIPredictionsView';
import { TradingTerminalView } from './components/views/TradingTerminalView';
import { PortfolioView } from './components/views/PortfolioView';
import { ModelPerformanceView } from './components/views/ModelPerformanceView';
import { TradeHistoryView } from './components/views/TradeHistoryView';
import { SettingsView } from './components/views/SettingsView';

import { 
  LayoutDashboard, 
  TrendingUp, 
  Cpu, 
  Terminal, 
  Briefcase,
  Menu
} from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    isWorkstationMenuOpen, 
    setIsWorkstationMenuOpen 
  } = useTrading();

  if (activeView === 'loading') {
    return (
      <LoadingAnimation 
        durationMs={4000} 
        onComplete={() => setActiveView('auth')} 
      />
    );
  }

  if (activeView === 'auth') {
    return <AuthView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'market':
        return <MarketOverviewView />;
      case 'predictions':
        return <AIPredictionsView />;
      case 'terminal':
        return <TradingTerminalView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'models':
        return <ModelPerformanceView />;
      case 'history':
        return <TradeHistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const mobileNavItems: { id: ActiveView | 'more'; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'market', label: 'Markets', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'terminal', label: 'Trade', icon: <Terminal className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'more', label: 'More ☰', icon: <Menu className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Dark Sidebar matching flow & collage */}
      <Sidebar />

      {/* Main Terminal Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Desktop Footer */}
        <Footer />

        {/* Mobile / Tablet Bottom Navigation Bar with More Menu */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-2 px-2 shadow-lg">
          {mobileNavItems.map(item => {
            const isMore = item.id === 'more';
            const isActive = !isMore && activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isMore) {
                    setIsWorkstationMenuOpen(true);
                  } else {
                    setActiveView(item.id as ActiveView);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50 font-bold' 
                    : isMore && isWorkstationMenuOpen
                    ? 'text-slate-900 bg-slate-100 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-emerald-600' : 'text-slate-600'}>
                  {item.icon}
                </span>
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Refined Workstation Menu Modal (All Options & Tools) */}
      <WorkstationMenu
        isOpen={isWorkstationMenuOpen}
        onClose={() => setIsWorkstationMenuOpen(false)}
      />

      {/* Red Alert Modal for Insufficient Funds (Centered with Blurred Backdrop) */}
      <InsufficientFundsModal />

      {/* Amber Alert Modal for Market Closed (320px Centered with Blurred Backdrop) */}
      <MarketClosedModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TradingProvider>
      <MainAppLayout />
    </TradingProvider>
  );
};

export default App;
