'use client';

import type { RiskMetrics as RiskMetricsType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskMetricsProps {
  gold: RiskMetricsType;
  silver: RiskMetricsType;
  className?: string;
}

interface MetricCardProps {
  label: string;
  goldValue: string;
  silverValue: string;
  description: string;
  higherIsBetter?: boolean;
  isPercent?: boolean;
  goldRaw: number;
  silverRaw: number;
}

function MetricCard({
  label,
  goldValue,
  silverValue,
  description,
  higherIsBetter = true,
  goldRaw,
  silverRaw,
}: MetricCardProps) {
  const goldBetter = higherIsBetter ? goldRaw > silverRaw : goldRaw < silverRaw;
  const silverBetter = !goldBetter && goldRaw !== silverRaw;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</h4>
      <p className="mt-0.5 text-[10px] text-text-muted">{description}</p>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-medium text-gold-primary">Gold</div>
          <div
            className={cn(
              'mt-0.5 font-mono text-xl font-bold',
              goldBetter ? 'text-text-primary' : 'text-text-secondary'
            )}
          >
            {goldValue}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-silver-primary">Silver</div>
          <div
            className={cn(
              'mt-0.5 font-mono text-xl font-bold',
              silverBetter ? 'text-text-primary' : 'text-text-secondary'
            )}
          >
            {silverValue}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRatio(value: number): string {
  return value.toFixed(2);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function RiskMetrics({ gold, silver, className }: RiskMetricsProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      <MetricCard
        label="Sharpe Ratio"
        description="Risk-adjusted return"
        goldValue={formatRatio(gold.sharpeRatio)}
        silverValue={formatRatio(silver.sharpeRatio)}
        goldRaw={gold.sharpeRatio}
        silverRaw={silver.sharpeRatio}
        higherIsBetter
      />
      <MetricCard
        label="Sortino Ratio"
        description="Downside risk-adjusted return"
        goldValue={formatRatio(gold.sortinoRatio)}
        silverValue={formatRatio(silver.sortinoRatio)}
        goldRaw={gold.sortinoRatio}
        silverRaw={silver.sortinoRatio}
        higherIsBetter
      />
      <MetricCard
        label="Max Drawdown"
        description="Largest peak-to-trough decline"
        goldValue={formatPercent(gold.maxDrawdown)}
        silverValue={formatPercent(silver.maxDrawdown)}
        goldRaw={gold.maxDrawdown}
        silverRaw={silver.maxDrawdown}
        higherIsBetter={false}
      />
      <MetricCard
        label="30D Volatility"
        description="Annualized 30-day volatility"
        goldValue={formatPercent(gold.volatility30d)}
        silverValue={formatPercent(silver.volatility30d)}
        goldRaw={gold.volatility30d}
        silverRaw={silver.volatility30d}
        higherIsBetter={false}
      />
    </div>
  );
}
