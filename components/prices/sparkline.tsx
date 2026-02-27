'use client';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, width = 80, height = 40, className }: SparklineProps) {
  if (!data.length) return null;

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#16A34A' : '#DC2626';
  const gradientId = `sparkline-${Math.random().toString(36).slice(2, 8)}`;

  const chartData = data.map((value, i) => ({ value, index: i }));

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
