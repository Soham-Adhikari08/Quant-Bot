import React, { createContext, useContext, useState, useEffect } from 'react';
import { StockQuote, Position, Order, UserAccount, MarketStatus } from '../types/trading';
import { INITIAL_STOCKS } from '../services/marketData';
import { getNSEMarketStatus, getNextMarketOpenSchedule } from '../services/marketHours';
const API_BASE_URL = "http://localhost:5000/api";
export type ActiveView = 
  | 'loading'
  | 'dashboard' 
  | 'market' 
  | 'predictions' 
  | 'terminal' 
  | 'portfolio' 
  | 'models' 
  | 'history' 
  | 'settings' 
  | 'auth';

export interface InsufficientFundsAlert {
  symbol: string;
  shares: number;
  price: number;
  orderCategory: string;
  requiredAmount: number;
  availableBalance: number;
  deficit: number;
  isAmo: boolean;
  reason: string;
}

export interface MarketClosedAlert {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  currentIstTime: string;
  nextOpenDateText: string;
  nextOpenTimeText: string;
  statusText: string;
}

interface TradingContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  startLoadingAnimation: () => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  stocks: Record<string, StockQuote>;
  currentStock: StockQuote;
  holdings: Position[];
  orders: Order[];
  account: UserAccount;
  marketStatus: MarketStatus;
  simulationOverride: boolean;
  setSimulationOverride: (override: boolean) => void;
  totalPortfolioValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  investedAmount: number;
  realisedPnl: number;
  unrealisedPnl: number;
  cashBalance: number;
  insufficientFundsAlert: InsufficientFundsAlert | null;
  dismissInsufficientFundsAlert: () => void;
  marketClosedAlert: MarketClosedAlert | null;
  dismissMarketClosedAlert: () => void;
  executeTrade: (params: {
    symbol: string;
    type: 'BUY' | 'SELL';
    orderCategory: 'Market' | 'Limit' | 'Stop Loss' | 'AMO';
    quantity: number;
    price: number;
    isAmo?: boolean;
  }) => { success: boolean; message: string; isInsufficientFunds?: boolean; isMarketClosed?: boolean };
  updateAccount: (updates: Partial<UserAccount>) => void;
  resetAccountState: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isWorkstationMenuOpen: boolean;
  setIsWorkstationMenuOpen: (open: boolean) => void;
}

const INITIAL_HOLDINGS: Position[] = [
  {
    id: 'pos-1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    type: 'BUY',
    quantity: 10,
    avgPrice: 1152.50,
    currentPrice: 1164.90,
    marketValue: 11649.00,
    pnl: 124.00,
    pnlPercent: 1.08,
    timestamp: 'Yesterday 15:20'
  },
  {
    id: 'pos-2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    type: 'BUY',
    quantity: 5,
    avgPrice: 2535.00,
    currentPrice: 2502.60,
    marketValue: 12513.00,
    pnl: -162.00,
    pnlPercent: -1.28,
    timestamp: 'Yesterday 14:10'
  },
  {
    id: 'pos-3',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    type: 'BUY',
    quantity: 8,
    avgPrice: 1166.00,
    currentPrice: 1185.00,
    marketValue: 9480.00,
    pnl: 152.00,
    pnlPercent: 1.63,
    timestamp: 'Yesterday 11:30'
  },
  {
    id: 'pos-4',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    type: 'BUY',
    quantity: 10,
    avgPrice: 688.05,
    currentPrice: 692.80,
    marketValue: 6928.00,
    pnl: 47.50,
    pnlPercent: 0.69,
    timestamp: 'Yesterday 10:15'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    symbol: 'RELIANCE',
    type: 'BUY',
    orderCategory: 'Market',
    quantity: 10,
    price: 1152.50,
    totalValue: 11525.00,
    status: 'Closed',
    pnl: 124.00,
    timestamp: '30 Oct 15:20'
  },
  {
    id: 'ord-2',
    symbol: 'TCS',
    type: 'BUY',
    orderCategory: 'Limit',
    quantity: 5,
    price: 2535.00,
    totalValue: 12675.00,
    status: 'Closed',
    pnl: -162.00,
    timestamp: '30 Oct 14:10'
  },
  {
    id: 'ord-3',
    symbol: 'INFY',
    type: 'BUY',
    orderCategory: 'Market',
    quantity: 8,
    price: 1166.00,
    totalValue: 9328.00,
    status: 'Closed',
    pnl: 152.00,
    timestamp: '30 Oct 11:30'
  },
  {
    id: 'ord-4',
    symbol: 'HDFCBANK',
    type: 'BUY',
    orderCategory: 'Limit',
    quantity: 10,
    price: 688.05,
    totalValue: 6880.50,
    status: 'Closed',
    pnl: 47.50,
    timestamp: '30 Oct 10:15'
  }
];

const INITIAL_ACCOUNT: UserAccount = {
  username: 'sisnrc',
  email: 'trader@quantbot.in',
  fullName: 'S. N. Roy Choudhury',
  clientId: 'QB884102',
  mobile: '9876543210',
  panNumber: 'ABCDE1234F',
  dob: '1992-08-14',
  annualIncome: ' 10 - 25 Lakhs',
  tradingExperience: 'Intermediate (1-3 Years)',
  segments: ['NSE Equities (Cash)', 'Quant Algorithmic Automated', 'Futures & Options (F&O)'],
  bankName: 'HDFC Bank Ltd.',
  bankAccountNumber: '5010023910842',
  ifscCode: 'HDFC0000014',
  dematAccountNumber: '1208160004928173',
  mpin: '140892',
  isKycVerified: true,
  riskDisclosureAccepted: true,
  virtualBalance: 59427.50,
  initialCapital: 100000.00,
  riskLevel: 'Medium',
  maxPositionSize: 10,
  stopLossPercent: 2.5
};

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('loading');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [stocks, setStocks] = useState<Record<string, StockQuote>>(INITIAL_STOCKS);
  const [holdings, setHoldings] = useState<Position[]>(INITIAL_HOLDINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [account, setAccount] = useState<UserAccount>(INITIAL_ACCOUNT);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isWorkstationMenuOpen, setIsWorkstationMenuOpen] = useState<boolean>(false);
  const [simulationOverride, setSimulationOverride] = useState<boolean>(false);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(getNSEMarketStatus());
  
  const [insufficientFundsAlert, setInsufficientFundsAlert] = useState<InsufficientFundsAlert | null>(null);
  const [marketClosedAlert, setMarketClosedAlert] = useState<MarketClosedAlert | null>(null);

  const dismissInsufficientFundsAlert = () => {
    setInsufficientFundsAlert(null);
  };

  const dismissMarketClosedAlert = () => {
    setMarketClosedAlert(null);
  };

  // Update market open/closed status clock every second for precision ticking
  useEffect(() => {
    // Initial sync
    setMarketStatus(getNSEMarketStatus());
    
    const statusInterval = setInterval(() => {
      setMarketStatus(getNSEMarketStatus());
    }, 1000);
    
    return () => clearInterval(statusInterval);
  }, []);

  // Fetch real market quotes from server proxy
  useEffect(() => {
    let isMounted = true;
    
    const fetchLiveQuotes = async () => {
      try {
        const res = await fetch('/api/market/quotes');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.quotes && Object.keys(data.quotes).length > 0) {
            setStocks(prev => ({ ...prev, ...data.quotes }));
          }
        }
      } catch (err) {
        // network fallback
      }
    };
    
    fetchLiveQuotes();
    const interval = setInterval(fetchLiveQuotes, 15000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Recalculate holdings market value and P&L with latest stock prices
  useEffect(() => {
    setHoldings(prev => 
      prev.map(pos => {
        const stock = stocks[pos.symbol];
        if (!stock) return pos;
        
        const currentPrice = stock.price;
        const marketValue = Number((currentPrice * pos.quantity).toFixed(2));
        const costBasis = pos.avgPrice * pos.quantity;
        const pnl = Number((marketValue - costBasis).toFixed(2));
        const pnlPercent = Number(((pnl / costBasis) * 100).toFixed(2));
        
        return {
          ...pos,
          currentPrice,
          marketValue,
          pnl,
          pnlPercent
        };
      })
    );
  }, [stocks]);

  // Portfolio calculations
  const investedAmount = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const unrealisedPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const realisedPnl = 2450.00;
  const cashBalance = account.virtualBalance;
  
  const totalPortfolioValue = Number((cashBalance + investedAmount + unrealisedPnl).toFixed(2));
  const totalPnl = Number((realisedPnl + unrealisedPnl).toFixed(2));
  const totalPnlPercent = Number(((totalPnl / account.initialCapital) * 100).toFixed(2));

  const executeTrade = ({
    symbol,
    type,
    orderCategory,
    quantity,
    price,
    isAmo = false
  }: {
    symbol: string;
    type: 'BUY' | 'SELL';
    orderCategory: 'Market' | 'Limit' | 'Stop Loss' | 'AMO';
    quantity: number;
    price: number;
    isAmo?: boolean;
  }) => {
    const totalCost = Number((quantity * price).toFixed(2));
    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    // 1. Strict Balance Verification for BUY Trades (Always triggers Red Alert Modal if traded above available balance)
    if (type === 'BUY' && totalCost > account.virtualBalance) {
      const deficit = Number((totalCost - account.virtualBalance).toFixed(2));
      const isAmoOrder = isAmo || orderCategory === 'AMO';
      
      setInsufficientFundsAlert({
        symbol,
        shares: quantity,
        price,
        orderCategory: isAmoOrder ? 'AMO' : orderCategory,
        requiredAmount: totalCost,
        availableBalance: account.virtualBalance,
        deficit,
        isAmo: isAmoOrder,
        reason: `Your available virtual cash balance of ₹${account.virtualBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} is insufficient to execute this order requiring ₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. A cash deficit of ₹${deficit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} prevents this trade from executing.`
      });
      
      return { 
        success: false, 
        message: `Insufficient cash balance. Cash deficit: ₹${deficit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        isInsufficientFunds: true 
      };
    }

    // 2. Strict Market Closed Verification (Triggers 320px Market Closed modal popup)
    if (!marketStatus.isOpen && !simulationOverride && !isAmo && orderCategory !== 'AMO') {
      const schedule = getNextMarketOpenSchedule();
      
      setMarketClosedAlert({
        symbol,
        type,
        quantity,
        currentIstTime: schedule.currentIstTime,
        nextOpenDateText: schedule.nextOpenDateText,
        nextOpenTimeText: schedule.nextOpenTimeText,
        statusText: schedule.statusText
      });
      
      return { 
        success: false, 
        message: `Market is currently closed (${schedule.currentIstTime}). Regular trading opens on ${schedule.nextOpenDateText} at ${schedule.nextOpenTimeText}.`,
        isMarketClosed: true
      };
    }

    // 3. Handle After Market Order (AMO) Queuing
    if (isAmo || orderCategory === 'AMO') {
      const amoOrder: Order = {
        id: `amo-${Date.now()}`,
        symbol,
        type,
        orderCategory: 'AMO',
        quantity,
        price,
        totalValue: totalCost,
        status: 'Queued (AMO)',
        isAmo: true,
        timestamp: `${timeStr} (AMO)`
      };
      setOrders(prev => [amoOrder, ...prev]);
      return { 
        success: true, 
        message: `AMO Order Queued: ${type} ${quantity} ${symbol} @ ₹${price.toFixed(2)}. Will execute at 09:15 IST.` 
      };
    }

    // 4. Regular Execution (Market Open or Simulation Override enabled)
    if (type === 'BUY') {
      setAccount(prev => ({
        ...prev,
        virtualBalance: Number((prev.virtualBalance - totalCost).toFixed(2))
      }));

      setHoldings(prev => {
        const existing = prev.find(p => p.symbol === symbol);
        if (existing) {
          const newQty = existing.quantity + quantity;
          const newAvgPrice = Number(((existing.avgPrice * existing.quantity + totalCost) / newQty).toFixed(2));
          
          return prev.map(p => p.symbol === symbol ? {
            ...p,
            quantity: newQty,
            avgPrice: newAvgPrice,
            marketValue: Number((newQty * price).toFixed(2)),
            pnl: Number(((price - newAvgPrice) * newQty).toFixed(2)),
            pnlPercent: Number((((price - newAvgPrice) / newAvgPrice) * 100).toFixed(2))
          } : p);
        } else {
          return [
            ...prev,
            {
              id: `pos-${Date.now()}`,
              symbol,
              name: stocks[symbol]?.name || symbol,
              type: 'BUY',
              quantity,
              avgPrice: price,
              currentPrice: price,
              marketValue: totalCost,
              pnl: 0,
              pnlPercent: 0,
              timestamp: timeStr
            }
          ];
        }
      });
    } else {
      const existing = holdings.find(p => p.symbol === symbol);
      if (!existing || existing.quantity < quantity) {
        return { success: false, message: `You do not hold enough ${symbol} shares to sell.` };
      }

      setAccount(prev => ({
        ...prev,
        virtualBalance: Number((prev.virtualBalance + totalCost).toFixed(2))
      }));

      setHoldings(prev => {
        if (existing.quantity === quantity) {
          return prev.filter(p => p.symbol !== symbol);
        } else {
          const remainingQty = existing.quantity - quantity;
          return prev.map(p => p.symbol === symbol ? {
            ...p,
            quantity: remainingQty,
            marketValue: Number((remainingQty * price).toFixed(2)),
            pnl: Number(((price - p.avgPrice) * remainingQty).toFixed(2)),
            pnlPercent: Number((((price - p.avgPrice) / p.avgPrice) * 100).toFixed(2))
          } : p);
        }
      });
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      symbol,
      type,
      orderCategory,
      quantity,
      price,
      totalValue: totalCost,
      status: 'Closed',
      pnl: type === 'SELL' ? Number(((price - (holdings.find(h => h.symbol === symbol)?.avgPrice || price)) * quantity).toFixed(2)) : undefined,
      timestamp: timeStr
    };

    setOrders(prev => [newOrder, ...prev]);

    return { 
      success: true, 
      message: `Executed ${type} ${quantity} ${symbol} @ ₹${price.toFixed(2)} (${simulationOverride ? 'Simulation Override' : 'Market Filled'})` 
    };
  };

  const updateAccount = (updates: Partial<UserAccount>) => {
    setAccount(prev => ({ ...prev, ...updates }));
  };

  const startLoadingAnimation = () => {
    setActiveView('loading');
  };

  const resetAccountState = () => {
    setAccount(INITIAL_ACCOUNT);
    setHoldings(INITIAL_HOLDINGS);
    setOrders(INITIAL_ORDERS);
  };
const defaultStock: StockQuote = {
    symbol: selectedSymbol,
    name: selectedSymbol,
    price: 0,
    change: 0,
    changePercent: 0,
    open: 0,
    high: 0,
    low: 0,
    prevClose: 0,
    volume: 0,
    volumeFormatted: '0',
    week52High: 0,
    week52Low: 0,
    isRealTime: false,
    lastUpdated: 'Connecting...'
  };

  const currentStock = stocks[selectedSymbol] || Object.values(stocks)[0] || defaultStock;
  return (
    <TradingContext.Provider
      value={{
        activeView,
        setActiveView,
        startLoadingAnimation,
        selectedSymbol,
        setSelectedSymbol,
        stocks,
        currentStock,
        holdings,
        orders,
        account,
        marketStatus,
        simulationOverride,
        setSimulationOverride,
        totalPortfolioValue,
        totalPnl,
        totalPnlPercent,
        investedAmount,
        realisedPnl,
        unrealisedPnl,
        cashBalance,
        insufficientFundsAlert,
        dismissInsufficientFundsAlert,
        marketClosedAlert,
        dismissMarketClosedAlert,
        executeTrade,
        updateAccount,
        resetAccountState,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isWorkstationMenuOpen,
        setIsWorkstationMenuOpen
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};