import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { STOCK_AI_SIGNALS, RECENT_PREDICTIONS } from '../../services/quantEngine';

export const AIPredictionsView: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol, setActiveView } = useTrading();
  const [subTab, setSubTab] = useState<'Current Signal' | 'Model Outputs' | 'Historical Performance'>('Current Signal');

  const signal = STOCK_AI_SIGNALS[selectedSymbol] || STOCK_AI_SIGNALS.RELIANCE;

  const featureWeights = [
    { feature: 'RSI(14) Momentum Delta', weight: 0.28, type: 'Momentum' },
    { feature: 'EMA(20/50) Slope Consensus', weight: 0.24, type: 'Trend' },
    { feature: 'Order Flow Imbalance (Bid/Ask)', weight: 0.19, type: 'Microstructure' },
    { feature: 'Volume Surge Ratio vs 20D Avg', weight: 0.17, type: 'Liquidity' },
    { feature: 'Historical Mean Reversion Spread', weight: 0.12, type: 'Statistical' }
  ];

  const regimeWinRates = [
    { regime: 'Trending Bull Market', winRate: '78.4%', sharpe: 1.62, trades: 142 },
    { regime: 'Range Consolidation', winRate: '68.2%', sharpe: 1.34, trades: 198 },
    { regime: 'High Volatility Reversals', winRate: '72.1%', sharpe: 1.48, trades: 86 }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header matching Collage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            AI Prediction Centre
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Model predictions, confidence and final decision
          </p>
        </div>

        <button
          onClick={() => setActiveView('terminal')}
          className="self-start sm:self-auto px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span>Trade {selectedSymbol}</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

      {/* Tabs: [Current Signal] [Model Outputs] [Historical Performance] */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs overflow-x-auto">
        {(['Current Signal', 'Model Outputs', 'Historical Performance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`pb-3 px-4 font-semibold transition-all cursor-pointer border-b-2 -mb-[1px] whitespace-nowrap ${
              subTab === tab
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'Current Signal' && (
        <>
          {/* 3 AI Model Architecture Cards matching Collage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Regression Model */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Regression Model</h3>
                  <span className="text-[10px] font-mono text-slate-400">Continuous Magnitude</span>
                </div>

                <div className="text-xs text-slate-500 mb-1">Predicted Return (Magnitude)</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 mb-3">
                  +{signal.regressionReturn}%
                </div>

                {/* Mini SVG Trend Line */}
                <div className="h-12 w-full my-2">
                  <svg viewBox="0 0 200 48" className="w-full h-full">
                    <path
                      d="M 5,40 Q 50,30 90,32 T 150,18 T 195,6"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="195" cy="6" r="4" fill="#10B981" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Based on historical price momentum, moving average slopes, and volume surge expansion.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-sans">Confidence</span>
                <span className="font-bold text-slate-900">{signal.regressionConfidence}%</span>
              </div>
            </div>

            {/* Card 2: Classification Model */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Classification Model</h3>
                  <span className="text-[10px] font-mono text-slate-400">Direction & Prob</span>
                </div>

                <div className="text-xs text-slate-500 mb-3">Direction & Probability</div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span className="font-bold flex items-center gap-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        UP
                      </span>
                      <span className="font-bold text-emerald-600">{signal.classificationProb.up}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${signal.classificationProb.up}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span className="font-bold flex items-center gap-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        DOWN
                      </span>
                      <span className="font-bold text-rose-600">{signal.classificationProb.down}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${signal.classificationProb.down}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span className="font-bold flex items-center gap-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        HOLD
                      </span>
                      <span className="text-slate-500">{signal.classificationProb.hold}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${signal.classificationProb.hold}%` }} />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                  Based on calibrated multi-class probability classifier trained on multi-cycle NSE market regimes.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-sans">Confidence</span>
                <span className="font-bold text-slate-900">{signal.classificationConfidence}%</span>
              </div>
            </div>

            {/* Card 3: Fusion Engine */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Fusion Engine</h3>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">Consensus Active</span>
                </div>

                <div className="text-xs text-slate-500 mb-3">Final Decision</div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center mb-3">
                  <div className="text-3xl font-extrabold font-mono text-emerald-700">
                    BUY
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 mt-1">
                    Confidence: {signal.confidence}%
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Combines return magnitude, directional probability, and model agreement weights to generate authoritative order execution instructions.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-sans">Model Agreement</span>
                <span className="font-bold text-emerald-600">88.4%</span>
              </div>
            </div>
          </div>

          {/* Recent Predictions Table matching Collage */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Recent Predictions</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Regression</th>
                    <th className="pb-3">Classification</th>
                    <th className="pb-3">Fusion</th>
                    <th className="pb-3">Decision</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_PREDICTIONS.map((item, idx) => (
                    <tr key={`${item.symbol}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono text-slate-500">{item.time}</td>
                      <td className="py-3 font-bold font-mono text-slate-900">{item.symbol}</td>
                      <td className="py-3 font-mono font-semibold text-emerald-600">
                        {item.regression}
                      </td>
                      <td className="py-3 font-mono text-slate-700">
                        {item.classification}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          item.fusion === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {item.fusion}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          item.decision === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {item.decision}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSymbol(item.symbol);
                            setActiveView('terminal');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#0F172A] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {subTab === 'Model Outputs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Feature Importance & ShAP Values</h3>
          <p className="text-xs text-slate-500">
            Real-time algorithmic feature contributions to the current signal.
          </p>
          <div className="space-y-3 pt-2">
            {featureWeights.map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{f.feature} <span className="text-slate-400">({f.type})</span></span>
                  <span className="font-mono font-bold text-slate-900">{(f.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${f.weight * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'Historical Performance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Regime-Specific Historical Accuracy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {regimeWinRates.map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">{r.regime}</div>
                <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">{r.winRate}</div>
                <div className="text-[11px] text-slate-500 mt-1">Sharpe: {r.sharpe} | {r.trades} Trades</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
