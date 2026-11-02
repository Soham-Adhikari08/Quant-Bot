import React from 'react';

interface DonutSlice {
  label: string;
  percent: number;
  color: string;
}

interface DonutChartProps {
  totalValue: number;
  slices?: DonutSlice[];
}

export const DonutChart: React.FC<DonutChartProps> = ({
  totalValue,
  slices = [
    { label: 'RELIANCE', percent: 28, color: '#0F172A' },
    { label: 'TCS', percent: 19, color: '#10B981' },
    { label: 'INFY', percent: 11, color: '#3B82F6' },
    { label: 'HDFCBANK', percent: 8, color: '#F59E0B' },
    { label: 'Others', percent: 34, color: '#94A3B8' }
  ]
}) => {
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[180px]">
        <svg width={size} height={size} className="transform -rotate-90">
          {slices.map((slice, i) => {
            const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (slice.percent / 100) * circumference;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center label matching collage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-extrabold font-mono text-slate-900 tracking-tight">
            ₹{totalValue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Legend matching collage */}
      <div className="flex flex-col gap-1.5 mt-5 w-full max-w-[200px]">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="font-medium text-slate-800">{slice.label}</span>
            </div>
            <span className="font-mono text-slate-500 font-semibold">{slice.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
