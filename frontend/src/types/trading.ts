export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  volumeFormatted: string;
  week52High: number;
  week52Low: number;
  isRealTime: boolean;
  lastUpdated: string;
}

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  sma200: number;
  rsi14: number;
  rsiState: 'Oversold' | 'Neutral' | 'Overbought';
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  macdState: 'Bullish' | 'Neutral' | 'Bearish';
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
}

export interface AISignal {
  symbol: string;
  timestamp: string;
  decision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  regressionReturn: number;
  regressionConfidence: number;
  classificationProb: {
    up: number;
    down: number;
    hold: number;
  };
  classificationConfidence: number;
  fusionAgreement: number;
  summary: string;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderCategory: 'Market' | 'Limit' | 'Stop Loss' | 'AMO';
  quantity: number;
  price: number;
  totalValue: number;
  status: 'Executed' | 'Closed' | 'Cancelled' | 'Queued (AMO)';
  pnl?: number;
  timestamp: string;
  isAmo?: boolean;
}

export interface UserAccount {
  username: string;
  email: string;
  fullName: string;
  clientId: string;
  mobile: string;
  panNumber: string;
  dob: string;
  annualIncome: string;
  tradingExperience: string;
  segments: string[];
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  dematAccountNumber: string;
  mpin: string;
  isKycVerified: boolean;
  riskDisclosureAccepted: boolean;
  virtualBalance: number;
  initialCapital: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  maxPositionSize: number;
  stopLossPercent: number;
}

export type MarketPhase = 'PRE_OPEN' | 'REGULAR_OPEN' | 'POST_CLOSE' | 'CLOSED';

export interface MarketTimelineEvent {
  time: string;
  label: string;
  passed: boolean;
  active: boolean;
  percentage?: number;
}

export interface MarketStatus {
  isOpen: boolean;
  phase: MarketPhase;
  phaseLabel: string;
  istTime: string;
  istDate: string;
  weekday: string;
  statusText: string;
  nextSessionText: string;
  timeRemainingText: string;
  secondsRemaining: number;
  sessionProgressPercent: number;
  timelineProgressPercent?: number;
  isWeekend: boolean;
  isHoliday: boolean;
  timelineEvents: MarketTimelineEvent[];
}
