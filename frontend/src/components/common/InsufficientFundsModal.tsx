import React, { useEffect, useState, useRef } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { useTrading, InsufficientFundsAlert } from '../../context/TradingContext';

export const InsufficientFundsModal: React.FC = () => {
  const { insufficientFundsAlert, dismissInsufficientFundsAlert } = useTrading();
  
  // Local active copy to preserve alert data during smooth exit transition
  const [activeAlert, setActiveAlert] = useState<InsufficientFundsAlert | null>(null);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const exitTimeoutRef = useRef<number | null>(null);

  // Synchronize with TradingContext alert state
  useEffect(() => {
    if (insufficientFundsAlert) {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      setActiveAlert(insufficientFundsAlert);
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
  }, [insufficientFundsAlert]);

  // Smooth dismiss handler
  const handleDismiss = () => {
    setIsVisible(false);
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
    exitTimeoutRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setActiveAlert(null);
      dismissInsufficientFundsAlert();
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
    shares,
    requiredAmount,
    availableBalance,
    deficit,
    isAmo
  } = activeAlert;

  const formattedDeficit = deficit.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formattedRequired = requiredAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formattedAvailable = availableBalance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="insufficient-funds-title"
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
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Compact Header with Red Alert Icon and INSUFFICIENT BALANCE text */}
        <div className="flex items-center gap-2.5 mb-3.5 pr-6">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="min-w-0">
            <h2
              id="insufficient-funds-title"
              className="text-xs font-bold uppercase tracking-wider text-rose-500 leading-tight"
            >
              Insufficient Balance
            </h2>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {isAmo ? 'AMO' : 'Market'} Order • BUY {shares} {symbol}
            </p>
          </div>
        </div>

        {/* Clean Broker Margin Breakdown Table */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 mb-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Required Margin</span>
            <span className="font-mono text-slate-200 font-medium">₹{formattedRequired}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Available Funds</span>
            <span className="font-mono text-slate-300 font-medium">₹{formattedAvailable}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between">
            <span className="text-slate-400 text-[11px] font-medium">Cash Shortfall</span>
            <span className="font-mono text-white font-bold text-sm tracking-tight">
              -₹{formattedDeficit}
            </span>
          </div>
        </div>

        {/* Action Button: Dark slate terminal button with subtle border */}
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
