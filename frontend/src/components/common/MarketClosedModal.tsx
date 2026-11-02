import React, { useEffect, useState, useRef } from 'react';
import { Clock, X } from 'lucide-react';
import { useTrading, MarketClosedAlert } from '../../context/TradingContext';

export const MarketClosedModal: React.FC = () => {
  const { marketClosedAlert, dismissMarketClosedAlert } = useTrading();

  // Local active copy to preserve alert data during smooth exit transition
  const [activeAlert, setActiveAlert] = useState<MarketClosedAlert | null>(null);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const exitTimeoutRef = useRef<number | null>(null);

  // Synchronize with TradingContext alert state
  useEffect(() => {
    if (marketClosedAlert) {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      setActiveAlert(marketClosedAlert);
      setIsRendered(true);

      // Trigger smooth entrance transition on next animation frame
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      const timer = window.setTimeout(() => {
        setIsRendered(false);
        setActiveAlert(null);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [marketClosedAlert]);

  // Smooth dismiss handler
  const handleDismiss = () => {
    setIsVisible(false);
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
    exitTimeoutRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setActiveAlert(null);
      dismissMarketClosedAlert();
    }, 220);
  };

  // Handle Escape key to dismiss smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  if (!isRendered || !activeAlert) {
    return null;
  }

  const {
    symbol,
    type,
    quantity,
    currentIstTime,
    nextOpenDateText,
    nextOpenTimeText,
    statusText
  } = activeAlert;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-closed-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto select-none"
    >
      {/* Smoothly Fading Blurred Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Ultra-Slim (~320px) Broker-Style Card */}
      <div
        className={`relative w-full max-w-[324px] bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-slate-950/90 text-white z-10 overflow-hidden transform transition-all duration-200 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Compact Header with Amber Clock Icon and MARKET CLOSED text */}
        <div className="flex items-center gap-2.5 mb-3.5 pr-6">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2
              id="market-closed-title"
              className="text-xs font-bold uppercase tracking-wider text-amber-400 leading-tight"
            >
              Market Closed
            </h2>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {statusText || 'Continuous trading concluded'}
            </p>
          </div>
        </div>

        {/* Clean Broker Market Schedule Table */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 mb-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Attempted Order</span>
            <span className="font-mono text-slate-200 font-medium">
              {type} {quantity} {symbol}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Current Time</span>
            <span className="font-mono text-slate-300 font-medium">{currentIstTime}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between">
            <span className="text-slate-400 text-[11px] font-medium">Market Opens</span>
            <div className="text-right">
              <span className="font-mono text-emerald-400 font-bold text-xs block">
                {nextOpenTimeText}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {nextOpenDateText}
              </span>
            </div>
          </div>
        </div>

        {/* Single Action Button: Dark slate terminal button with subtle border */}
        <button
          onClick={handleDismiss}
          autoFocus
          className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700/90 active:bg-slate-850 text-slate-100 border border-slate-700 shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          Understood
        </button>
      </div>
    </div>
  );
};
