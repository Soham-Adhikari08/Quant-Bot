import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CandleData } from '../../types/trading';
import { calculateSMA, calculateRSISeries } from '../../services/marketData';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  X, 
  MoveHorizontal 
} from 'lucide-react';

export interface CandlestickChartProps {
  candles: CandleData[];
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  onTimeframeChange?: (tf: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL') => void;
  activeIndicator?: 'SMA' | 'RSI' | 'MACD' | 'Bollinger Bands' | 'None';
  onIndicatorChange?: (ind: 'SMA' | 'RSI' | 'MACD' | 'Bollinger Bands' | 'None') => void;
  height?: number;
  showTimeframeSelector?: boolean;
  allowZoom?: boolean;
  symbol?: string;
  stockName?: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  activeIndicator = 'None',
  onIndicatorChange,
  height = 360,
  showTimeframeSelector = true,
  allowZoom = true,
  symbol = 'RELIANCE',
  stockName = 'Reliance Industries Ltd.'
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x to 6x
  const [panOffset, setPanOffset] = useState<number>(0); // 0 to 1
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentIndicator, setCurrentIndicator] = useState<'SMA' | 'RSI' | 'MACD' | 'Bollinger Bands' | 'None'>(activeIndicator);
  
  // Real measured canvas pixel dimensions via ResizeObserver
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 760,
    height: height
  });

  // Dragging state for mouse pan
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartPan, setDragStartPan] = useState<number>(0);

  // Touch tracking ref for mobile pinch-to-zoom & drag-pan
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    startX: number;
    startPan: number;
    isPinch: boolean;
  }>({
    initialDist: 0,
    initialZoom: 1,
    startX: 0,
    startPan: 0,
    isPinch: false
  });

  const chartBoxRef = useRef<HTMLDivElement>(null);
  const fullscreenCanvasRef = useRef<HTMLDivElement>(null);

  // Sync indicator prop
  useEffect(() => {
    setCurrentIndicator(activeIndicator);
  }, [activeIndicator]);

  // Measure container dimensions dynamically
  useEffect(() => {
    const activeEl = isFullscreen ? fullscreenCanvasRef.current : chartBoxRef.current;
    if (!activeEl) return;

    const measure = () => {
      const rect = activeEl.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        setCanvasSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(activeEl);
    return () => observer.disconnect();
  }, [isFullscreen, height]);

  // Escape key exits fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isFullscreen]);

  // Native non-passive wheel event listener for smooth laptop trackpad pinch & mouse wheel
  useEffect(() => {
    const activeEl = isFullscreen ? fullscreenCanvasRef.current : chartBoxRef.current;
    if (!activeEl || !allowZoom) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        // Trackpad pinch gesture
        const pinchDelta = -e.deltaY * 0.04;
        setZoomLevel(prev => {
          const next = Math.max(1, Math.min(6, Number((prev + pinchDelta).toFixed(2))));
          if (next === 1) setPanOffset(0);
          return next;
        });
      } else {
        // Mouse wheel scroll
        if (Math.abs(e.deltaY) > 2) {
          const wheelStep = e.deltaY < 0 ? 0.35 : -0.35;
          setZoomLevel(prev => {
            const next = Math.max(1, Math.min(6, Number((prev + wheelStep).toFixed(2))));
            if (next === 1) setPanOffset(0);
            return next;
          });
        }
      }
    };

    activeEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      activeEl.removeEventListener('wheel', handleNativeWheel);
    };
  }, [isFullscreen, allowZoom]);

  // Sliced candles based on zoom & pan
  const visibleCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    if (zoomLevel <= 1) return candles;

    const visibleCount = Math.max(5, Math.round(candles.length / zoomLevel));
    const maxOffset = candles.length - visibleCount;
    const startIndex = Math.min(maxOffset, Math.max(0, Math.round(panOffset * maxOffset)));
    return candles.slice(startIndex, startIndex + visibleCount);
  }, [candles, zoomLevel, panOffset]);

  // Dynamic price scaling for visible candles
  const { minPrice, maxPrice, maxVolume, priceRange } = useMemo(() => {
    if (!visibleCandles || visibleCandles.length === 0) {
      return { minPrice: 1000, maxPrice: 1300, maxVolume: 1000000, priceRange: 300 };
    }
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;
    visibleCandles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });
    const padding = (max - min) * 0.08 || 10;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: maxVol || 1,
      priceRange: (max + padding) - (min - padding)
    };
  }, [visibleCandles]);

  // Mobile check based on measured width
  const isMobile = canvasSize.width < 640;

  // Chart layout dimensions derived from actual container size
  const showSubPanel = currentIndicator === 'RSI' || currentIndicator === 'MACD';
  const subPanelHeight = showSubPanel ? (isMobile ? 55 : (isFullscreen ? 90 : 70)) : 0;
  const volumeHeight = isMobile ? 35 : (isFullscreen ? 65 : 48);
  const paddingTop = isMobile ? 18 : 24;
  const paddingLeft = isMobile ? 8 : 12;
  const paddingRight = isMobile ? 52 : 68;
  const priceChartHeight = Math.max(80, canvasSize.height - volumeHeight - subPanelHeight - paddingTop - 24);

  const activeCandle = hoverIndex !== null && visibleCandles[hoverIndex] 
    ? visibleCandles[hoverIndex] 
    : visibleCandles[visibleCandles.length - 1];

  const candleWidth = useMemo(() => {
    if (visibleCandles.length === 0) return 6;
    const availableWidth = canvasSize.width - paddingLeft - paddingRight;
    const slot = availableWidth / visibleCandles.length;
    return Math.max(2.5, Math.min(isMobile ? 20 : 32, slot * 0.74));
  }, [visibleCandles.length, canvasSize.width, paddingLeft, paddingRight, isMobile]);

  const getY = (val: number) => {
    return paddingTop + priceChartHeight - ((val - minPrice) / priceRange) * priceChartHeight;
  };

  const getVolY = (vol: number) => {
    const volTop = paddingTop + priceChartHeight + 6;
    return volTop + volumeHeight - (vol / maxVolume) * volumeHeight;
  };

  // Indicators calculation
  const sma20 = useMemo(() => calculateSMA(visibleCandles, 5), [visibleCandles]);
  const sma50 = useMemo(() => calculateSMA(visibleCandles, 12), [visibleCandles]);
  const sma200 = useMemo(() => calculateSMA(visibleCandles, 20), [visibleCandles]);
  const rsiSeries = useMemo(() => calculateRSISeries(visibleCandles, 10), [visibleCandles]);

  const timeframes: ('1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL')[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  const indicatorOptions: ('None' | 'SMA' | 'RSI' | 'MACD' | 'Bollinger Bands')[] = [
    'None', 'SMA', 'RSI', 'MACD', 'Bollinger Bands'
  ];

  const priceSteps = [0.1, 0.4, 0.7, 0.95].map(ratio => {
    const p = minPrice + ratio * priceRange;
    return { price: p, y: getY(p) };
  });

  const buildLinePath = (series: (number | null)[]) => {
    const availableWidth = canvasSize.width - paddingLeft - paddingRight;
    const slot = availableWidth / visibleCandles.length;
    let path = '';
    series.forEach((val, i) => {
      if (val === null) return;
      const x = paddingLeft + i * slot + slot / 2;
      const y = getY(val);
      if (!path) {
        path = `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  // Active candle change calculation
  const candleChange = activeCandle ? activeCandle.close - activeCandle.open : 0;
  const candleChangePct = activeCandle && activeCandle.open > 0 ? (candleChange / activeCandle.open) * 100 : 0;
  const isCandleBullish = candleChange >= 0;

  // Selected candle X position
  const selectedX = hoverIndex !== null && visibleCandles[hoverIndex]
    ? paddingLeft + hoverIndex * ((canvasSize.width - paddingLeft - paddingRight) / visibleCandles.length) + ((canvasSize.width - paddingLeft - paddingRight) / visibleCandles.length) / 2
    : null;

  const selectedY = activeCandle ? getY(activeCandle.close) : null;

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(6, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPanOffset(0);
      return next;
    });
  };

  const handleSetZoomLevel = (level: number) => {
    setZoomLevel(level);
    if (level === 1) setPanOffset(0);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset(0);
  };

  // Mouse drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartPan(panOffset);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStartX;
      const sensitivity = 0.003 / zoomLevel;
      const newPan = Math.max(0, Math.min(1, dragStartPan - dx * sensitivity));
      setPanOffset(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Multi-touch pinch-to-zoom & drag-pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers: pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoomLevel,
        startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        startPan: panOffset,
        isPinch: true
      };
    } else if (e.touches.length === 1) {
      // 1 finger: pan or tap inspect
      touchStateRef.current = {
        initialDist: 0,
        initialZoom: zoomLevel,
        startX: e.touches[0].clientX,
        startPan: panOffset,
        isPinch: false
      };
      if (zoomLevel > 1) {
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinch && touchStateRef.current.initialDist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDist / touchStateRef.current.initialDist;
      const nextZoom = Math.max(1, Math.min(6, Number((touchStateRef.current.initialZoom * scale).toFixed(2))));
      setZoomLevel(nextZoom);
      if (nextZoom === 1) setPanOffset(0);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      const dx = e.touches[0].clientX - touchStateRef.current.startX;
      const sensitivity = 0.003 / zoomLevel;
      const nextPan = Math.max(0, Math.min(1, touchStateRef.current.startPan - dx * sensitivity));
      setPanOffset(nextPan);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStateRef.current.isPinch = false;
  };

  const handleIndicatorSelect = (ind: 'SMA' | 'RSI' | 'MACD' | 'Bollinger Bands' | 'None') => {
    setCurrentIndicator(ind);
    onIndicatorChange?.(ind);
  };

  // Single unified SVG chart renderer that adapts to exact measured pixels
  const renderSvgChart = () => {
    const gridColor = '#F1E9DE';
    const textColor = '#8F8175';
    const crosshairColor = '#0F172A';

    return (
      <svg
        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        width="100%"
        height="100%"
        className="w-full h-full block select-none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="volGreenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="volRedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {priceSteps.map((step, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={step.y}
              x2={canvasSize.width - paddingRight}
              y2={step.y}
              stroke={gridColor}
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={canvasSize.width - paddingRight + (isMobile ? 4 : 8)}
              y={step.y + 3.5}
              className="text-[9px] sm:text-[10px] font-mono tabular-nums font-medium"
              fill={textColor}
            >
              {step.price.toFixed(isMobile ? 1 : 2)}
            </text>
          </g>
        ))}

        {/* Bollinger Bands Overlay */}
        {currentIndicator === 'Bollinger Bands' && (
          <g>
            <path
              d={buildLinePath(visibleCandles.map(c => c.close * 1.025))}
              fill="none"
              stroke="#059669"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            <path
              d={buildLinePath(visibleCandles.map(c => c.close * 0.992))}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <path
              d={buildLinePath(visibleCandles.map(c => c.close * 0.960))}
              fill="none"
              stroke="#e11d48"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
          </g>
        )}

        {/* SMA Overlay */}
        {currentIndicator === 'SMA' && (
          <g>
            <path d={buildLinePath(sma20)} fill="none" stroke="#d97706" strokeWidth={isMobile ? "1.5" : "2"} strokeLinecap="round" />
            <path d={buildLinePath(sma50)} fill="none" stroke="#2563eb" strokeWidth={isMobile ? "1.5" : "1.8"} strokeLinecap="round" />
            <path d={buildLinePath(sma200)} fill="none" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="3 2" />
          </g>
        )}

        {/* Candlesticks & Volume */}
        {visibleCandles.map((candle, idx) => {
          const availableWidth = canvasSize.width - paddingLeft - paddingRight;
          const slot = availableWidth / visibleCandles.length;
          const x = paddingLeft + idx * slot + slot / 2;
          const isBullish = candle.close >= candle.open;
          const candleColor = isBullish ? '#059669' : '#e11d48';

          const openY = getY(candle.open);
          const closeY = getY(candle.close);
          const highY = getY(candle.high);
          const lowY = getY(candle.low);
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(2, Math.abs(closeY - openY));

          const volY = getVolY(candle.volume);
          const volBase = paddingTop + priceChartHeight + 6 + volumeHeight;
          const volHeight = Math.max(2, volBase - volY);

          const isHovered = hoverIndex === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              onTouchStart={() => setHoverIndex(idx)}
            >
              {/* Wick */}
              <line 
                x1={x} 
                y1={highY} 
                x2={x} 
                y2={lowY} 
                stroke={candleColor} 
                strokeWidth={zoomLevel > 1.8 ? "1.8" : "1.1"} 
              />

              {/* Candle Body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={candleColor}
                rx="1"
                className={isHovered ? 'filter drop-shadow-md brightness-110' : ''}
              />

              {/* Volume Bar */}
              <rect
                x={x - candleWidth / 2}
                y={volY}
                width={candleWidth}
                height={volHeight}
                fill={isBullish ? 'url(#volGreenGrad)' : 'url(#volRedGrad)'}
                stroke={candleColor}
                strokeWidth="0.5"
              />

              {/* Wide touch/hover hit zone */}
              <rect
                x={x - slot / 2}
                y={paddingTop}
                width={slot}
                height={canvasSize.height - paddingTop - 16}
                fill="transparent"
              />
            </g>
          );
        })}

        {/* RSI Sub-Chart Panel */}
        {currentIndicator === 'RSI' && (
          <g transform={`translate(0, ${canvasSize.height - subPanelHeight - 12})`}>
            <rect 
              x={paddingLeft} 
              y="0" 
              width={canvasSize.width - paddingLeft - paddingRight} 
              height={subPanelHeight} 
              fill="#faf5ff" 
              opacity="0.6" 
            />
            <line x1={paddingLeft} y1="12" x2={canvasSize.width - paddingRight} y2="12" stroke="#a855f7" strokeDasharray="2 2" strokeWidth="0.8" />
            <line x1={paddingLeft} y1={subPanelHeight - 12} x2={canvasSize.width - paddingRight} y2={subPanelHeight - 12} stroke="#a855f7" strokeDasharray="2 2" strokeWidth="0.8" />
            
            <text x={canvasSize.width - paddingRight + 4} y="14" className="text-[8px] sm:text-[9px] font-mono fill-purple-700 font-semibold">70</text>
            <text x={canvasSize.width - paddingRight + 4} y={subPanelHeight - 8} className="text-[8px] sm:text-[9px] font-mono fill-purple-700 font-semibold">30</text>

            <path
              d={visibleCandles.map((_, i) => {
                const val = rsiSeries[i] || 50;
                const availableWidth = canvasSize.width - paddingLeft - paddingRight;
                const slot = availableWidth / visibleCandles.length;
                const x = paddingLeft + i * slot + slot / 2;
                const y = subPanelHeight - (val / 100) * subPanelHeight;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* MACD Sub-Chart Panel */}
        {currentIndicator === 'MACD' && (
          <g transform={`translate(0, ${canvasSize.height - subPanelHeight - 12})`}>
            <rect 
              x={paddingLeft} 
              y="0" 
              width={canvasSize.width - paddingLeft - paddingRight} 
              height={subPanelHeight} 
              fill="#f0fdf4" 
              opacity="0.5" 
            />
            <line x1={paddingLeft} y1={subPanelHeight / 2} x2={canvasSize.width - paddingRight} y2={subPanelHeight / 2} stroke="#cbd5e1" strokeWidth="1" />
            <text x={canvasSize.width - paddingRight + 4} y={subPanelHeight / 2 + 3} className="text-[8px] sm:text-[9px] font-mono" fill={textColor}>0.0</text>

            {visibleCandles.map((c, i) => {
              const availableWidth = canvasSize.width - paddingLeft - paddingRight;
              const slot = availableWidth / visibleCandles.length;
              const x = paddingLeft + i * slot + slot / 2;
              const diff = (c.close - c.open) * 0.8;
              const barH = Math.min(subPanelHeight / 2 - 3, Math.abs(diff));
              const isPos = diff >= 0;
              const y = isPos ? (subPanelHeight / 2 - barH) : (subPanelHeight / 2);

              return (
                <rect
                  key={i}
                  x={x - candleWidth / 2}
                  y={y}
                  width={candleWidth}
                  height={Math.max(2, barH)}
                  fill={isPos ? '#059669' : '#e11d48'}
                />
              );
            })}
          </g>
        )}

        {/* Interactive Crosshairs */}
        {selectedX !== null && (
          <g pointerEvents="none">
            <line
              x1={selectedX}
              y1={paddingTop}
              x2={selectedX}
              y2={canvasSize.height - 18}
              stroke={crosshairColor}
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            <rect
              x={selectedX - 26}
              y={canvasSize.height - 15}
              width="52"
              height="14"
              fill="#0F172A"
              rx="3"
            />
            <text
              x={selectedX}
              y={canvasSize.height - 5}
              textAnchor="middle"
              className="text-[8px] sm:text-[9px] font-mono fill-white font-bold"
            >
              {activeCandle?.time}
            </text>

            {selectedY !== null && (
              <>
                <line
                  x1={paddingLeft}
                  y1={selectedY}
                  x2={canvasSize.width - paddingRight}
                  y2={selectedY}
                  stroke={crosshairColor}
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <rect
                  x={canvasSize.width - paddingRight + 2}
                  y={selectedY - 7}
                  width={isMobile ? 50 : 64}
                  height="14"
                  fill="#0F172A"
                  rx="3"
                />
                <text
                  x={canvasSize.width - paddingRight + (isMobile ? 26 : 33)}
                  y={selectedY + 3.5}
                  textAnchor="middle"
                  className="text-[8px] sm:text-[9px] font-mono fill-white font-bold"
                >
                  {activeCandle?.close.toFixed(isMobile ? 1 : 2)}
                </text>
              </>
            )}
          </g>
        )}

        {/* Timeline Labels on X-axis */}
        {selectedX === null && visibleCandles.filter((_, i) => i % Math.max(1, Math.ceil(visibleCandles.length / (isMobile ? 4 : 7))) === 0).map((c, i) => {
          const idx = visibleCandles.indexOf(c);
          const availableWidth = canvasSize.width - paddingLeft - paddingRight;
          const slot = availableWidth / visibleCandles.length;
          const x = paddingLeft + idx * slot + slot / 2;
          return (
            <text
              key={i}
              x={x}
              y={canvasSize.height - 4}
              textAnchor="middle"
              className="text-[8px] sm:text-[9px] font-mono font-medium"
              fill={textColor}
            >
              {c.time}
            </text>
          );
        })}
      </svg>
    );
  };

  // Fullscreen Modal Content (rendered via createPortal directly into document.body)
  const fullscreenPortal = isFullscreen && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] text-[#0F172A] flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden select-none">
      
      {/* Responsive Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-xs flex flex-col gap-2 shrink-0 mb-2">
        
        {/* Row 1: Stock Brand + Real-time Price + Exit Fullscreen Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F172A] flex items-center justify-center font-bold text-emerald-400 font-mono text-sm shrink-0 shadow-xs">
              Q
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-extrabold font-mono text-[#0F172A] truncate">
                  {symbol}
                </span>
                <span className={`text-xs font-mono font-bold shrink-0 ${isCandleBullish ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {activeCandle ? `₹${activeCandle.close.toFixed(2)}` : ''}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  FULLSCREEN
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate hidden sm:block">
                {stockName}
              </div>
            </div>
          </div>

          {/* Quick Exit Fullscreen Action */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-all shadow-xs shrink-0"
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-700" />
            <span>Exit Fullscreen</span>
            <span className="hidden sm:inline px-1 py-0.2 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-500">Esc</span>
          </button>
        </div>

        {/* Row 2: Controls Toolbar (Timeframe, Indicators, Zoom) with clean horizontal scroll for mobile */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {/* Timeframes */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange?.(tf)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  timeframe === tf
                    ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0">
            {indicatorOptions.map(ind => (
              <button
                key={ind}
                onClick={() => handleIndicatorSelect(ind)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  currentIndicator === ind
                    ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Zoom Buttons & Percentage */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs gap-1 shrink-0">
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 6}
              title="Zoom In (+)"
              className="p-1 hover:bg-white rounded text-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] font-mono px-1 font-bold text-slate-900">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              title="Zoom Out (-)"
              className="p-1 hover:bg-white rounded text-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                title="Reset Zoom to 1x"
                className="p-1 hover:bg-white rounded text-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Bar: Active Candle HUD + Timeline Pan Slider */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0 text-xs font-mono">
        {/* Active Candle OHLCV HUD */}
        {activeCandle ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-[#0F172A] border border-slate-700 text-slate-100 px-3 py-1 rounded-xl shadow-xs text-[11px] sm:text-xs">
            <span className="text-emerald-400 font-bold">{activeCandle.time}</span>
            <span className="text-slate-500">|</span>
            <span>O: <strong className="text-white">{activeCandle.open.toFixed(1)}</strong></span>
            <span>H: <strong className="text-emerald-400">{activeCandle.high.toFixed(1)}</strong></span>
            <span>L: <strong className="text-rose-400">{activeCandle.low.toFixed(1)}</strong></span>
            <span>C: <strong className="text-white font-bold">{activeCandle.close.toFixed(1)}</strong></span>
            <span className={`font-bold ${isCandleBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCandleBullish ? '+' : ''}{candleChange.toFixed(1)} ({isCandleBullish ? '+' : ''}{candleChangePct.toFixed(1)}%)
            </span>
          </div>
        ) : (
          <div className="text-slate-500 font-mono text-[11px]">Hover or drag across pattern to inspect</div>
        )}

        {/* Timeline Pan Scrubber (Visible when zoomed in) */}
        {zoomLevel > 1 ? (
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
            <MoveHorizontal className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="text-[10px] text-slate-600 font-bold uppercase">Pan:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={panOffset}
              onChange={(e) => setPanOffset(parseFloat(e.target.value))}
              className="w-24 sm:w-36 accent-[#0F172A] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#0F172A] font-bold font-mono">{zoomLevel}x</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Pinch or scroll to zoom (1x to 6x) • Drag horizontally to pan</span>
          </div>
        )}
      </div>

      {/* Main Fullscreen High-Resolution Canvas Card */}
      <div 
        ref={fullscreenCanvasRef}
        className={`flex-1 w-full min-h-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-1 sm:p-2 relative flex items-center justify-center shadow-xs touch-none overflow-hidden ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Floating corner exit button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-md backdrop-blur-xs transition-all cursor-pointer group"
          title="Exit Fullscreen (Esc)"
        >
          <X className="w-4 h-4 text-slate-700 group-hover:text-rose-600 transition-colors" />
        </button>

        {renderSvgChart()}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* =========================================================================
          NORMAL INLINE CANDLESTICK CHART
         ========================================================================= */}
      <div className="w-full flex flex-col select-none relative">
        {/* Top Controls: Floating HUD + Timeframe + Zoom Controls + Fullscreen Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
          {/* Active Candle Info Bar */}
          {activeCandle ? (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono bg-[#0F172A] border border-slate-700 text-slate-100 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="text-emerald-400 font-bold">{activeCandle.time}</span>
              <span className="text-slate-500">|</span>
              <span>O: <strong className="text-white">{activeCandle.open.toFixed(2)}</strong></span>
              <span>H: <strong className="text-emerald-400">{activeCandle.high.toFixed(2)}</strong></span>
              <span>L: <strong className="text-rose-400">{activeCandle.low.toFixed(2)}</strong></span>
              <span>C: <strong className="text-white font-bold">{activeCandle.close.toFixed(2)}</strong></span>
              <span className={`font-bold ${isCandleBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCandleBullish ? '+' : ''}{candleChange.toFixed(2)} ({isCandleBullish ? '+' : ''}{candleChangePct.toFixed(2)}%)
              </span>
              <span className="hidden sm:inline text-slate-400">
                Vol: <strong className="text-slate-200">{(activeCandle.volume / 1000).toFixed(0)}k</strong>
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono">Hover to inspect candle</div>
          )}

          {/* Right side: Timeframes + Zoom Controls + Fullscreen Observation Button */}
          <div className="flex flex-wrap items-center gap-2">
            {showTimeframeSelector && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium border border-slate-200">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    onClick={() => onTimeframeChange?.(tf)}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-xs ${
                      timeframe === tf
                        ? 'bg-[#0F172A] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}

            {/* Interactive Zoom Controls & Presets */}
            {allowZoom && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs gap-1 border border-slate-200">
                <div className="hidden sm:flex items-center gap-0.5 mr-1 pr-1 border-r border-slate-200">
                  {[1, 1.5, 2, 3, 4, 6].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => handleSetZoomLevel(lvl)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
                        zoomLevel === lvl 
                          ? 'bg-[#0F172A] text-white font-bold' 
                          : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      {lvl}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 6}
                  title="Zoom In (+)"
                  className="p-1 hover:bg-white rounded text-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <span className="text-[10px] font-mono px-1 font-bold text-slate-900">
                  {Math.round(zoomLevel * 100)}%
                </span>

                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  title="Zoom Out (-)"
                  className="p-1 hover:bg-white rounded text-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {zoomLevel > 1 && (
                  <button
                    onClick={handleResetZoom}
                    title="Reset Zoom to 1x"
                    className="p-1 hover:bg-white rounded text-slate-800 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Zoom Panning Slider & Interactive Indicator (when zoomed in) */}
        {zoomLevel > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <MoveHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[10px] text-slate-600 font-mono font-bold uppercase shrink-0">Pan Timeline:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={panOffset}
                onChange={(e) => setPanOffset(parseFloat(e.target.value))}
                className="flex-1 accent-[#0F172A] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
              <span className="font-bold text-slate-900">
                Zoom: {zoomLevel}x ({visibleCandles.length} candles in focus)
              </span>
              <span className="hidden md:inline text-slate-400">
                Pinch/Scroll to zoom • Drag chart to pan
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-400 font-mono px-1 mb-1">
            <span>Scroll wheel or pinch trackpad to zoom (1x–6x) • Click corner [⛶] for Fullscreen</span>
            <span>Showing all {visibleCandles.length} candles</span>
          </div>
        )}

        {/* SVG Canvas Box Area */}
        <div 
          ref={chartBoxRef}
          style={{ height: `${height}px` }}
          className={`relative w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xs touch-none ${
            zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Prominent Corner Fullscreen Button right inside the chart canvas */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md border border-slate-200 backdrop-blur-xs transition-all cursor-pointer group"
            title="Fullscreen Observation"
          >
            <Maximize2 className="w-4 h-4 group-hover:scale-110 text-slate-700 group-hover:text-emerald-600 transition-all" />
          </button>

          {renderSvgChart()}
        </div>
      </div>

      {/* Render the portal for fullscreen mode */}
      {fullscreenPortal}
    </>
  );
};
