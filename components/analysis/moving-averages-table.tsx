'use client';

import { Check, X } from 'lucide-react';
import type { MovingAverageSignal } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

interface MovingAveragesTableProps {
  currentPrice: number;
  signals: MovingAverageSignal[];
  className?: string;
}

type OverallSignal = 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH';

function getOverallSignal(signals: MovingAverageSignal[]): OverallSignal {
  const aboveCount = signals.filter((s) => s.priceRelation === 'above').length;
  const total = signals.length;
  if (total === 0) return 'NEUTRAL';

  const ratio = aboveCount / total;
  if (ratio >= 0.9) return 'STRONG BULLISH';
  if (ratio >= 0.6) return 'BULLISH';
  if (ratio >= 0.4) return 'NEUTRAL';
  if (ratio >= 0.1) return 'BEARISH';
  return 'STRONG BEARISH';
}

const SIGNAL_COLORS: Record<OverallSignal, string> = {
  'STRONG BULLISH': 'text-up bg-up/10',
  'BULLISH': 'text-up bg-up/5',
  'NEUTRAL': 'text-text-muted bg-text-muted/10',
  'BEARISH': 'text-down bg-down/5',
  'STRONG BEARISH': 'text-down bg-down/10',
};

export function MovingAveragesTable({
  currentPrice,
  signals,
  className,
}: MovingAveragesTableProps) {
  const overall = getOverallSignal(signals);

  return (
    <div className={cn('rounded-lg border border-border bg-surface', className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">Moving Averages</h3>
        <p className="mt-0.5 text-xs text-text-muted">
          Current Price: <span className="font-mono font-medium text-text-primary">${formatPrice(currentPrice)}</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2 text-xs font-medium text-text-muted">Period</th>
              <th className="px-4 py-2 text-xs font-medium text-text-muted">MA Value</th>
              <th className="px-4 py-2 text-xs font-medium text-text-muted">Position</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">% Diff</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => {
              const isAbove = signal.priceRelation === 'above';
              return (
                <tr key={signal.period} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-text-primary">SMA {signal.period}</td>
                  <td className="px-4 py-2.5 font-mono text-text-secondary">${formatPrice(signal.value)}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('inline-flex items-center gap-1', isAbove ? 'text-up' : 'text-down')}>
                      {isAbove ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      <span className="text-xs font-medium">{isAbove ? 'Above' : 'Below'}</span>
                    </span>
                  </td>
                  <td className={cn('px-4 py-2.5 text-right font-mono', isAbove ? 'text-up' : 'text-down')}>
                    {signal.percentDiff >= 0 ? '+' : ''}{signal.percentDiff.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Overall Signal</span>
          <span className={cn('rounded-md px-3 py-1 text-xs font-bold', SIGNAL_COLORS[overall])}>
            {overall}
          </span>
        </div>
      </div>
    </div>
  );
}
