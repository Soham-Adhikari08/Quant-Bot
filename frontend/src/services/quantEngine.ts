import { AISignal } from '../types/trading';

export const STOCK_AI_SIGNALS: Record<string, AISignal> = {
  RELIANCE: {
    symbol: 'RELIANCE',
    timestamp: '10:24 AM IST',
    decision: 'BUY',
    confidence: 87.5,
    regressionReturn: 1.8,
    regressionConfidence: 76.3,
    classificationProb: {
      up: 87.5,
      down: 12.1,
      hold: 0.4
    },
    classificationConfidence: 82.6,
    fusionAgreement: 91.2,
    summary: 'High bullish momentum confirmed across trendline regressions and multi-factor gradient boost classifier.'
  },
  TCS: {
    symbol: 'TCS',
    timestamp: '09:52 AM IST',
    decision: 'SELL',
    confidence: 72.3,
    regressionReturn: -0.6,
    regressionConfidence: 71.0,
    classificationProb: {
      up: 18.2,
      down: 72.3,
      hold: 9.5
    },
    classificationConfidence: 74.8,
    fusionAgreement: 88.0,
    summary: 'Bearish divergence on MACD with regression pointing to short-term mean reversion.'
  },
  HDFCBANK: {
    symbol: 'HDFCBANK',
    timestamp: '09:31 AM IST',
    decision: 'BUY',
    confidence: 68.4,
    regressionReturn: 0.9,
    regressionConfidence: 65.2,
    classificationProb: {
      up: 68.4,
      down: 21.0,
      hold: 10.6
    },
    classificationConfidence: 69.1,
    fusionAgreement: 79.5,
    summary: 'Accumulation pattern confirmed by institutional volume surge and moving average support.'
  },
  INFY: {
    symbol: 'INFY',
    timestamp: '09:17 AM IST',
    decision: 'HOLD',
    confidence: 64.0,
    regressionReturn: 0.3,
    regressionConfidence: 60.5,
    classificationProb: {
      up: 32.1,
      down: 22.7,
      hold: 45.2
    },
    classificationConfidence: 63.4,
    fusionAgreement: 70.0,
    summary: 'Range-bound consolidation around 50 SMA with low volatility compression.'
  },
  ICICIBANK: {
    symbol: 'ICICIBANK',
    timestamp: '09:05 AM IST',
    decision: 'BUY',
    confidence: 78.2,
    regressionReturn: 1.4,
    regressionConfidence: 73.1,
    classificationProb: {
      up: 78.2,
      down: 14.5,
      hold: 7.3
    },
    classificationConfidence: 76.0,
    fusionAgreement: 84.7,
    summary: 'Bullish breakout past 200 EMA with positive sector rotation tailwind.'
  },
  SBIN: {
    symbol: 'SBIN',
    timestamp: '08:50 AM IST',
    decision: 'BUY',
    confidence: 74.5,
    regressionReturn: 1.1,
    regressionConfidence: 70.4,
    classificationProb: {
      up: 74.5,
      down: 19.0,
      hold: 6.5
    },
    classificationConfidence: 72.3,
    fusionAgreement: 81.2,
    summary: 'Consistent quarterly ROA expansion backing momentum breakout.'
  }
};

export interface RecentPrediction {
  time: string;
  symbol: string;
  regression: string;
  classification: string;
  fusion: 'BUY' | 'SELL' | 'HOLD';
  decision: 'BUY' | 'SELL' | 'HOLD';
}

export const RECENT_PREDICTIONS: RecentPrediction[] = [
  { time: '10:24', symbol: 'RELIANCE', regression: '+1.8%', classification: 'UP (87.5%)', fusion: 'BUY', decision: 'BUY' },
  { time: '09:52', symbol: 'TCS', regression: '-0.6%', classification: 'DOWN (72.3%)', fusion: 'SELL', decision: 'SELL' },
  { time: '09:31', symbol: 'HDFCBANK', regression: '+0.9%', classification: 'UP (68.4%)', fusion: 'BUY', decision: 'BUY' },
  { time: '09:17', symbol: 'INFY', regression: '+0.3%', classification: 'HOLD (45.2%)', fusion: 'HOLD', decision: 'HOLD' },
  { time: '08:45', symbol: 'ICICIBANK', regression: '+1.4%', classification: 'UP (78.2%)', fusion: 'BUY', decision: 'BUY' },
  { time: '08:30', symbol: 'SBIN', regression: '+1.1%', classification: 'UP (74.5%)', fusion: 'BUY', decision: 'BUY' }
];

export interface ModelPerformanceData {
  regression: {
    r2: number;
    mae: number;
    rmse: number;
    actualVsPredicted: { date: string; actual: number; predicted: number }[];
  };
  classification: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    overallAccuracy: number;
    confusionMatrix: {
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
  };
  fusion: {
    sharpeRatio: number;
    maxDrawdown: number;
    profitFactor: number;
    strategyComparison: {
      strategy: string;
      score: number;
    }[];
  };
}

export const MODEL_PERFORMANCE_METRICS: ModelPerformanceData = {
  regression: {
    r2: 0.782,
    mae: 12.43,
    rmse: 18.21,
    actualVsPredicted: [
      { date: 'Apr 1', actual: 2790, predicted: 2805 },
      { date: 'Apr 4', actual: 2812, predicted: 2810 },
      { date: 'Apr 8', actual: 2835, predicted: 2828 },
      { date: 'Apr 11', actual: 2820, predicted: 2825 },
      { date: 'Apr 15', actual: 2845, predicted: 2840 },
      { date: 'Apr 18', actual: 2860, predicted: 2855 },
      { date: 'Apr 22', actual: 2838, predicted: 2845 },
      { date: 'Apr 26', actual: 2852, predicted: 2848 },
      { date: 'Apr 30', actual: 2864, predicted: 2860 }
    ]
  },
  classification: {
    accuracy: 82.1,
    precision: 82.1,
    recall: 81.5,
    f1Score: 81.5,
    overallAccuracy: 87.6,
    confusionMatrix: {
      tp: 72,
      fp: 11,
      fn: 9,
      tn: 66
    }
  },
  fusion: {
    sharpeRatio: 1.42,
    maxDrawdown: -8.1,
    profitFactor: 1.63,
    strategyComparison: [
      { strategy: 'Regression', score: 0.82 },
      { strategy: 'Classification', score: 1.12 },
      { strategy: 'Hybrid / Fusion', score: 1.58 }
    ]
  }
};
