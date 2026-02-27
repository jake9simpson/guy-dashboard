'use client';

import type { PerformanceMetric } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PerformanceTableProps {
  metrics: PerformanceMetric[];
  goldHigh52w?: number;
  goldLow52w?: number;
  silverHigh52w?: number;
  silverLow52w?: number;
  className?: string;
}

function formatReturn(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatHighLow(value: number | undefined): string {
  if (value == null) return '--';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PerformanceTable({
  metrics,
  goldHigh52w,
  goldLow52w,
  silverHigh52w,
  silverLow52w,
  className,
}: PerformanceTableProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface', className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">Performance Comparison</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2 text-xs font-medium text-text-muted">Metric</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gold-primary">Gold</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-silver-primary">Silver</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.period} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-text-primary">{metric.period}</td>
                <td className={cn('px-4 py-2.5 text-right font-mono', metric.gold >= 0 ? 'text-up' : 'text-down')}>
                  {formatReturn(metric.gold)}
                </td>
                <td className={cn('px-4 py-2.5 text-right font-mono', metric.silver >= 0 ? 'text-up' : 'text-down')}>
                  {formatReturn(metric.silver)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-border/50">
              <td className="px-4 py-2.5 font-medium text-text-primary">52W High</td>
              <td className="px-4 py-2.5 text-right font-mono text-text-secondary">
                {formatHighLow(goldHigh52w)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-text-secondary">
                {formatHighLow(silverHigh52w)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-text-primary">52W Low</td>
              <td className="px-4 py-2.5 text-right font-mono text-text-secondary">
                {formatHighLow(goldLow52w)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-text-secondary">
                {formatHighLow(silverLow52w)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
