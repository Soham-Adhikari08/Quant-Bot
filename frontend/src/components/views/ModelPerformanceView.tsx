import React, { useState } from 'react';
import { MODEL_PERFORMANCE_METRICS } from '../../services/quantEngine';

export const ModelPerformanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All Models' | 'Regression Model' | 'Classification Model' | 'Fusion Engine'>('All Models');
  const [tp, setTp] = useState(72);
  const [fp, setFp] = useState(11);
  const [fn, setFn] = useState(9);
  const [tn, setTn] = useState(66);

  const { regression, fusion } = MODEL_PERFORMANCE_METRICS;

  const total = tp + fp + fn + tn || 1;
  const computedAccuracy = (((tp + tn) / total) * 100).toFixed(1);
  const computedPrecision = (((tp) / (tp + fp || 1)) * 100).toFixed(1);
  const computedRecall = (((tp) / (tp + fn || 1)) * 100).toFixed(1);
  const precNum = parseFloat(computedPrecision) / 100;
  const recNum = parseFloat(computedRecall) / 100;
  const computedF1 = (((2 * precNum * recNum) / (precNum + recNum || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header matching Collage */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Model Performance
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Evaluate and compare model accuracy
        </p>
      </div>

      {/* Tabs matching Collage */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs overflow-x-auto">
        {(['All Models', 'Regression Model', 'Classification Model', 'Fusion Engine'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-semibold transition-all cursor-pointer border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3 Model Metric Panels Grid matching Collage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Regression Panel matching Collage */}
        {(activeTab === 'All Models' || activeTab === 'Regression Model') && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Regression Model</h3>
                <span className="text-[10px] font-mono text-slate-400">Metrics</span>
              </div>

              {/* Regression Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-5 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">R²</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{regression.r2}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">MAE</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{regression.mae}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">RMSE</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{regression.rmse}</div>
                </div>
              </div>

              {/* Actual vs Predicted SVG Chart */}
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-slate-900">Actual vs Predicted</span>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-slate-800 font-bold">
                      <span className="w-2.5 h-1 bg-[#0F172A] rounded-sm" /> Actual
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <span className="w-2.5 h-1 bg-emerald-500 rounded-sm" /> Predicted
                    </span>
                  </div>
                </div>

                <div className="h-32 w-full">
                  <svg viewBox="0 0 300 110" className="w-full h-full overflow-visible">
                    <line x1="10" y1="20" x2="290" y2="20" stroke="#F1F5F9" />
                    <line x1="10" y1="55" x2="290" y2="55" stroke="#F1F5F9" />
                    <line x1="10" y1="90" x2="290" y2="90" stroke="#F1F5F9" />

                    {/* Predicted (Emerald Dashed) */}
                    <path
                      d="M 10,80 L 45,70 L 80,52 L 115,58 L 150,44 L 185,34 L 220,42 L 255,38 L 290,26"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Actual (Slate Dark Line) */}
                    <path
                      d="M 10,85 L 45,65 L 80,48 L 115,62 L 150,40 L 185,30 L 220,46 L 255,32 L 290,24"
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="2.5"
                    />

                    {/* Data Points */}
                    <circle cx="290" cy="24" r="3.5" fill="#0F172A" />
                    <circle cx="290" cy="26" r="3.5" fill="#10B981" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                  <span>Apr 1</span>
                  <span>Apr 8</span>
                  <span>Apr 15</span>
                  <span>Apr 22</span>
                  <span>Apr 30</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Low residual variance across volatile intraday sessions.
            </div>
          </div>
        )}

        {/* Classification Panel matching Collage */}
        {(activeTab === 'All Models' || activeTab === 'Classification Model') && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Classification Model</h3>
                <span className="text-[10px] font-mono text-slate-400">Metrics</span>
              </div>

              {/* 4 Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-5 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Accuracy</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{computedAccuracy}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Precision</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{computedPrecision}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Recall</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{computedRecall}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">F1 Score</div>
                  <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{computedF1}%</div>
                </div>
              </div>

              {/* Confusion Matrix matching Collage */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-900">Confusion Matrix</span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">Accuracy: {computedAccuracy}%</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-[10px] text-emerald-800 font-sans font-medium">True Positives (TP)</div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">{tp}</div>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="text-[10px] text-rose-800 font-sans font-medium">False Positives (FP)</div>
                    <div className="text-lg font-bold text-rose-700 mt-1">{fp}</div>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="text-[10px] text-rose-800 font-sans font-medium">False Negatives (FN)</div>
                    <div className="text-lg font-bold text-rose-700 mt-1">{fn}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-[10px] text-emerald-800 font-sans font-medium">True Negatives (TN)</div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">{tn}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              High true-positive sensitivity ensures minimal false breakout entries.
            </div>
          </div>
        )}

        {/* Fusion Engine Panel matching Collage */}
        {(activeTab === 'All Models' || activeTab === 'Fusion Engine') && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Fusion Engine</h3>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Ensemble</span>
              </div>

              {/* Fusion Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-5 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Sharpe Ratio</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{fusion.sharpeRatio}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Max Drawdown</div>
                  <div className="text-base font-bold font-mono text-rose-600 mt-0.5">{fusion.maxDrawdown}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Profit Factor</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{fusion.profitFactor}</div>
                </div>
              </div>

              {/* Strategy Comparison Bar Chart matching Collage */}
              <div>
                <span className="font-semibold text-slate-900 text-xs mb-3 block">Strategy Comparison</span>

                <div className="h-32 flex items-end justify-around gap-4 pt-4 px-2">
                  {/* Regression Bar */}
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-mono font-bold text-slate-700 mb-1">0.82</span>
                    <div className="w-full max-w-[40px] bg-slate-300 rounded-t-lg transition-all" style={{ height: '52px' }} />
                    <span className="text-[10px] text-slate-500 font-sans mt-2">Regression</span>
                  </div>

                  {/* Classification Bar */}
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-mono font-bold text-slate-700 mb-1">1.12</span>
                    <div className="w-full max-w-[40px] bg-slate-400 rounded-t-lg transition-all" style={{ height: '70px' }} />
                    <span className="text-[10px] text-slate-500 font-sans mt-2">Classification</span>
                  </div>

                  {/* Hybrid / Fusion Bar */}
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 mb-1">1.58</span>
                    <div className="w-full max-w-[40px] bg-emerald-500 rounded-t-lg transition-all shadow-sm" style={{ height: '100px' }} />
                    <span className="text-[10px] font-bold text-slate-900 font-sans mt-2">Hybrid</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Ensemble outperforms individual standalone model returns by +41%.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
