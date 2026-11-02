import React, { useEffect, useState, useMemo } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
  durationMs?: number; // Defaults to ~4000ms as requested
}

const WORDS = ['Trade', 'Analyze', 'Evolve'];

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onComplete,
  durationMs = 4000
}) => {
  // Phase tracking for choreographed timeline (0 to 4s)
  // phase 0: 0.0s -> initial mount
  // phase 1: 0.0 - 0.8s -> orbs fade in & drift, logo springs in (90% -> 100%)
  // phase 2: 0.8 - 1.4s -> "Quant-Bot" title fades up from 12px below
  // phase 3: 1.2 - 3.3s -> rotating word line appears and cycles words
  // phase 4: 3.3 - 4.0s -> entire intro fades out smoothly into app
  const [showLogo, setShowLogo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showRotatingLine, setShowRotatingLine] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordAnimState, setWordAnimState] = useState<'entering' | 'active' | 'exiting'>('active');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Check if reduced motion is preferred
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleContinue = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFadingOut]);

  useEffect(() => {
    // 0.0 - 0.8s: Logo & orbs fade in and scale
    const t0 = setTimeout(() => {
      setShowLogo(true);
    }, 40);

    // 0.8s: Title "Quant-Bot" fades up
    const t1 = setTimeout(() => {
      setShowTitle(true);
    }, 780);

    // 1.2s: Rotating word line appears
    const t2 = setTimeout(() => {
      setShowRotatingLine(true);
    }, 1200);

    // 2.05s (~0.85s after Word 0 appears): Roll from "Trade" -> "Analyze"
    const tRoll1Start = setTimeout(() => {
      setWordAnimState('exiting');
    }, 2050);

    const tRoll1End = setTimeout(() => {
      setCurrentWordIndex(1);
      setWordAnimState('entering');
      setTimeout(() => setWordAnimState('active'), 40);
    }, 2450);

    // 2.85s (~0.80s after Word 1): Roll from "Analyze" -> "Evolve"
    const tRoll2Start = setTimeout(() => {
      setWordAnimState('exiting');
    }, 2850);

    const tRoll2End = setTimeout(() => {
      setCurrentWordIndex(2);
      setWordAnimState('entering');
      setTimeout(() => setWordAnimState('active'), 40);
    }, 3250);

    // 3.3s: Entire screen fades out smoothly into login/signup
    const tFadeOut = setTimeout(() => {
      setIsFadingOut(true);
    }, 3350);

    // 4.0s: Transition complete
    const tComplete = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tRoll1Start);
      clearTimeout(tRoll1End);
      clearTimeout(tRoll2Start);
      clearTimeout(tRoll2End);
      clearTimeout(tFadeOut);
      clearTimeout(tComplete);
    };
  }, [durationMs, onComplete]);

  return (
    <div 
      onClick={handleContinue}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#FAFAFB',
        fontFamily: "'Google Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* =========================================================================
          BACKGROUND GLOWING AURORA (3 Large Softly Drifting Gradient Orbs)
          - Mint green, fresh emerald, soft teal
          - 25-35% opacity with deep 90-110px gaussian blur
          - Airy, warm, subtle, never muddy or neon
         ========================================================================= */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out overflow-hidden ${
          showLogo ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        {/* Orb 1: Soft Mint Green (Top-Left / Center Drift) */}
        <div
          className={`absolute rounded-full filter blur-[95px] md:blur-[120px] transition-all ${
            prefersReducedMotion ? '' : 'animate-luma-orb-1'
          }`}
          style={{
            width: 'clamp(280px, 42vw, 540px)',
            height: 'clamp(280px, 42vw, 540px)',
            top: '32%',
            left: '42%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.38) 0%, rgba(110, 231, 183, 0.24) 55%, transparent 75%)',
          }}
        />

        {/* Orb 2: Soft Fresh Emerald (Bottom-Right / Drift) */}
        <div
          className={`absolute rounded-full filter blur-[105px] md:blur-[135px] transition-all ${
            prefersReducedMotion ? '' : 'animate-luma-orb-2'
          }`}
          style={{
            width: 'clamp(290px, 44vw, 560px)',
            height: 'clamp(290px, 44vw, 560px)',
            top: '38%',
            left: '56%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.32) 0%, rgba(16, 185, 129, 0.20) 55%, transparent 75%)',
          }}
        />

        {/* Orb 3: Soft Teal (Bottom-Center / Drift) */}
        <div
          className={`absolute rounded-full filter blur-[90px] md:blur-[115px] transition-all ${
            prefersReducedMotion ? '' : 'animate-luma-orb-3'
          }`}
          style={{
            width: 'clamp(260px, 38vw, 490px)',
            height: 'clamp(260px, 38vw, 490px)',
            top: '46%',
            left: '48%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(94, 234, 212, 0.30) 0%, rgba(45, 212, 191, 0.18) 55%, transparent 75%)',
          }}
        />
      </div>

      {/* =========================================================================
          MAIN CENTERED CONTENT (Luma Style)
          - Centered in the top-middle area
          - Generous whitespace, clean, airy
         ========================================================================= */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg -mt-6 sm:-mt-10">
        
        {/* LOGO: Centered, crisp 4K/retina asset, soft drop shadow, 90% -> 100% spring */}
        <div 
          className="relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: showLogo ? 1 : 0,
            transform: showLogo ? 'scale(1)' : 'scale(0.90)',
            width: 'clamp(88px, 14vw, 124px)',
            height: 'clamp(88px, 14vw, 124px)',
          }}
        >
          {/* Soft ambient backlight beneath logo */}
          <div 
            className="absolute -inset-3 rounded-[32px] bg-gradient-to-tr from-emerald-300/30 via-teal-200/25 to-transparent blur-md pointer-events-none" 
            aria-hidden="true"
          />

          {/* User's Exact Logo Asset: Rendered crisp without distortion or recoloring */}
          <div className="relative w-full h-full rounded-[26px] sm:rounded-[30px] overflow-hidden bg-[#0F172A] shadow-xl shadow-slate-900/10 border border-slate-700/30 flex items-center justify-center p-0.5">
            <img
              src="/assets/aistudio/quant_bot._17eeebeb.png"
              alt="Quant-Bot"
              className="w-full h-full object-cover rounded-[24px] sm:rounded-[28px] select-none"
              decoding="async"
              loading="eager"
            />
          </div>
        </div>

        {/* WORDMARK: "Quant-Bot" (Fades up from 12px below at 0.8s) */}
        <h1
          className="mt-6 sm:mt-7 text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            color: '#111318',
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? 'translateY(0)' : 'translateY(12px)',
            letterSpacing: '-0.035em'
          }}
        >
          Quant-Bot
        </h1>

        {/* ROTATING WORD LINE: "[word] starts here" (Luma style) */}
        <div
          className="mt-2.5 sm:mt-3 flex items-center justify-center text-base sm:text-lg md:text-xl font-medium tracking-tight transition-all duration-600 ease-out"
          style={{
            color: '#111318',
            opacity: showRotatingLine ? 1 : 0,
            transform: showRotatingLine ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {/* Vertical Rolling Word Carousel (~400ms ease-in-out transition) */}
          <div 
            className="relative inline-flex items-center justify-center overflow-hidden h-[1.35em] mr-2 text-right"
            style={{ minWidth: '4.8ch' }}
          >
            <span
              key={currentWordIndex}
              className={`inline-block font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent transition-all duration-400 ease-in-out ${
                wordAnimState === 'entering'
                  ? 'transform translate-y-full opacity-0'
                  : wordAnimState === 'exiting'
                  ? 'transform -translate-y-full opacity-0'
                  : 'transform translate-y-0 opacity-100'
              }`}
            >
              {WORDS[currentWordIndex]}
            </span>
          </div>

          {/* Static phrase in dark charcoal */}
          <span className="font-normal text-slate-800">
            starts here
          </span>
        </div>

        {/* Subtle Understated Prompt to Continue to Login & Signup */}
        <div
          className="mt-10 sm:mt-12 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-all duration-500 cursor-pointer"
          style={{
            opacity: showRotatingLine ? 0.8 : 0,
            transform: showRotatingLine ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          <span>Continue to Log in &amp; Sign up</span>
          <span className="text-emerald-600 font-bold translate-x-0 group-hover:translate-x-0.5 transition-transform">→</span>
        </div>

      </div>

      {/* Global Embedded Styles for Organic Ambient Drift (GPU-accelerated) */}
      <style>{`
        @keyframes lumaOrb1 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
          }
          33% {
            transform: translate(-46%, -53%) scale(1.08) translate3d(12px, -8px, 0);
          }
          66% {
            transform: translate(-54%, -47%) scale(0.94) translate3d(-10px, 10px, 0);
          }
        }

        @keyframes lumaOrb2 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
          }
          33% {
            transform: translate(-54%, -46%) scale(0.93) translate3d(-14px, 12px, 0);
          }
          66% {
            transform: translate(-47%, -54%) scale(1.07) translate3d(10px, -9px, 0);
          }
        }

        @keyframes lumaOrb3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
          }
          50% {
            transform: translate(-51%, -48%) scale(1.06) translate3d(8px, 10px, 0);
          }
        }

        .animate-luma-orb-1 {
          animation: lumaOrb1 9s ease-in-out infinite alternate;
          will-change: transform;
        }

        .animate-luma-orb-2 {
          animation: lumaOrb2 11s ease-in-out infinite alternate;
          will-change: transform;
        }

        .animate-luma-orb-3 {
          animation: lumaOrb3 8s ease-in-out infinite alternate;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-luma-orb-1,
          .animate-luma-orb-2,
          .animate-luma-orb-3 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
