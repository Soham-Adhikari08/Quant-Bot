import React, { useState } from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  textColor?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  showTagline = false,
  textColor = 'text-[#0F172A]'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
    '2xl': 'w-28 h-28 rounded-3xl',
  };

  const textMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-[#0F172A] border border-slate-700/40 shadow-sm ${sizeMap[size]}`}
      >
        {!imageError ? (
          <img
            src="/assets/aistudio/quant_bot._17eeebeb.png"
            alt="Quant-Bot Logo"
            className="w-full h-full object-cover scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity SVG match of the logo with white Q and green slash */
          <div className="w-full h-full flex items-center justify-center bg-[#0F172A] relative p-1.5">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="48" cy="48" r="28" stroke="#FFFFFF" strokeWidth="12" />
              <path
                d="M 46 52 L 78 80"
                stroke="#10B981"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight ${textColor} ${textMap[size]} leading-none`}>
            Quant-Bot
          </span>
          {showTagline ? (
            <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">
              Trade · Analyze · Evolve
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 font-mono tracking-wider uppercase font-semibold mt-0.5">
              Dual-Model AI Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
};
