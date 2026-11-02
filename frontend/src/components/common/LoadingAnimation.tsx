import React from 'react';
import { IntroScreen } from './IntroScreen';

interface LoadingAnimationProps {
  onComplete: () => void;
  durationMs?: number; // Defaults to ~4000ms
}

/**
 * LoadingAnimation is now the clean, friendly, Luma-inspired IntroScreen.
 * All previous noisy elements (bull illustration, candlestick background, progress bar, timer, initializing text, skip button)
 * have been completely replaced with an airy, subtle glowing aurora and rotating wordmark.
 */
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  onComplete,
  durationMs = 4000 
}) => {
  return <IntroScreen onComplete={onComplete} durationMs={durationMs} />;
};

export { IntroScreen };
