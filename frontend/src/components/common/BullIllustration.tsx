import React from 'react';

interface BullIllustrationProps {
  className?: string;
  size?: number;
}

export const BullIllustration: React.FC<BullIllustrationProps> = ({ 
  className = '', 
  size = 280 
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 400 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <defs>
          {/* Metallic Silver-Blue Bull Gradients */}
          <linearGradient id="bullBodyGrad" x1="50" y1="50" x2="350" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="35%" stopColor="#CBD5E1" />
            <stop offset="70%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="bullHornGrad" x1="100" y1="40" x2="160" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="bullGlow" x1="200" y1="100" x2="200" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="bullHighlight" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient floor shadow & energy glow */}
        <ellipse cx="200" cy="250" rx="150" ry="20" fill="url(#bullGlow)" />
        <ellipse cx="200" cy="252" rx="120" ry="12" fill="#0F172A" fillOpacity="0.12" />

        {/* Tail */}
        <path
          d="M 60 140 C 45 120 40 100 48 85 C 50 82 54 85 52 90 C 46 102 55 120 72 135 Z"
          fill="#64748B"
        />

        {/* Hind Leg Left */}
        <path
          d="M 90 145 C 85 170 80 200 75 240 L 95 242 C 102 215 110 185 115 160 Z"
          fill="#475569"
        />

        {/* Hind Leg Right (Fore) */}
        <path
          d="M 125 140 C 130 170 120 210 115 245 L 138 245 C 145 210 152 175 145 145 Z"
          fill="url(#bullBodyGrad)"
        />

        {/* Main Muscular Torso & Rump */}
        <path
          d="M 85 140 C 95 110 130 95 180 98 C 220 100 250 80 280 65 C 300 55 315 65 325 85 C 335 100 325 125 310 145 C 285 175 240 185 180 180 C 130 175 95 165 85 140 Z"
          fill="url(#bullBodyGrad)"
        />

        {/* Powerful Shoulder Hump */}
        <path
          d="M 230 90 C 255 70 285 60 305 75 C 315 82 305 110 280 125 C 255 120 240 105 230 90 Z"
          fill="url(#bullHighlight)"
        />

        {/* Front Leg Left (Back) */}
        <path
          d="M 270 140 C 275 170 285 205 295 242 L 315 240 C 305 200 295 165 285 135 Z"
          fill="#475569"
        />

        {/* Front Leg Right (Charging Forward) */}
        <path
          d="M 295 135 C 315 165 335 195 365 235 L 345 242 C 320 205 300 175 285 145 Z"
          fill="url(#bullBodyGrad)"
        />

        {/* Powerful Head & Neck lowered for Charge */}
        <path
          d="M 285 75 C 310 70 335 85 350 110 C 360 125 355 145 340 150 C 320 155 305 145 295 130 C 285 115 280 95 285 75 Z"
          fill="url(#bullBodyGrad)"
        />

        {/* Snout & Jaw */}
        <path
          d="M 335 125 C 355 130 368 140 365 152 C 362 160 350 162 338 156 C 330 152 328 140 335 125 Z"
          fill="#334155"
        />

        {/* Fierce Horn (Left) */}
        <path
          d="M 315 70 C 330 45 355 25 375 28 C 365 42 345 62 330 78 Z"
          fill="url(#bullHornGrad)"
        />

        {/* Fierce Horn (Right - Foreground) */}
        <path
          d="M 325 80 C 350 50 380 30 395 32 C 382 50 358 75 338 90 Z"
          fill="#F1F5F9"
        />

        {/* Glowing Quant Eye */}
        <circle cx="332" cy="105" r="3" fill="#10B981" />
        <circle cx="332" cy="105" r="6" fill="#10B981" fillOpacity="0.4" />

        {/* Muscular Contour Lines */}
        <path
          d="M 140 115 C 160 135 190 145 220 140"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
        <path
          d="M 245 105 C 265 125 280 145 295 165"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.25"
        />
        <path
          d="M 175 102 C 205 105 235 118 255 135"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.2"
        />
      </svg>
    </div>
  );
};
