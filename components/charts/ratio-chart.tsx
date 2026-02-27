'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { LineData } from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RatioChartProps {
  data: LineData[];
  currentRatio: number;
  historicalAverage?: number;
  height?: number;
  className?: string;
}

function getRatioContext(current: number, average: number): string {
  const diff = ((current - average) / average) * 100;
  if (diff > 15) return 'well above';
  if (diff > 5) return 'above';
  if (diff < -15) return 'well below';
  if (diff < -5) return 'below';
  return 'near';
}

export function RatioChart({
  data,
  currentRatio,
  historicalAverage = 65,
  height = 300,
  className,
}: RatioChartProps) {
  const context = getRatioContext(currentRatio, historicalAverage);

  return (
    <div className={cn('rounded-lg border border-border bg-surface p-4', className)}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Gold/Silver Ratio</h3>
          <p className="mt-1 text-xs text-text-muted">
            It takes <span className="font-semibold text-text-secondary">{currentRatio.toFixed(1)}</span> ounces
            of silver to buy 1 ounce of gold
          </p>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <span className="font-mono text-3xl font-bold text-text-primary">
            {currentRatio.toFixed(1)}
          </span>
          <div className="mt-0.5 flex items-center gap-1.5 sm:justify-end">
            <span className={cn(
              'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
              context === 'well above' || context === 'above'
                ? 'bg-amber-50 text-amber-700'
                : context === 'well below' || context === 'below'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
            )}>
              {context} avg ({historicalAverage})
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id="ratioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.silver.primary} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.silver.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: COLORS.text.muted }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: COLORS.text.muted }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number | undefined) => [(value ?? 0).toFixed(2), 'Ratio']}
          />
          <ReferenceLine
            y={currentRatio}
            stroke={COLORS.text.primary}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            label={{
              value: `Current ${currentRatio.toFixed(1)}`,
              position: 'left',
              fill: COLORS.text.primary,
              fontSize: 10,
              fontWeight: 600,
            }}
          />
          {historicalAverage && (
            <ReferenceLine
              y={historicalAverage}
              stroke={COLORS.text.muted}
              strokeDasharray="6 4"
              label={{
                value: `Avg ${historicalAverage.toFixed(0)}`,
                position: 'right',
                fill: COLORS.text.muted,
                fontSize: 10,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={COLORS.silver.primary}
            strokeWidth={2}
            fill="url(#ratioGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
