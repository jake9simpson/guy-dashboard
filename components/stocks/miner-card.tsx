'use client';

import type { StockQuote } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { PriceChange } from '@/components/common/price-change';
import { Sparkline } from '@/components/prices/sparkline';

interface MinerCardProps {
  stock: StockQuote;
  sparklineData?: number[];
  className?: string;
}

export function MinerCard({ stock, sparklineData, className }: MinerCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-4 card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-text-primary">
              {stock.symbol}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-text-muted leading-tight">
            {stock.name}
          </p>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline data={sparklineData} width={72} height={36} />
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-lg font-bold text-text-primary">
          ${formatPrice(stock.price)}
        </span>
        <PriceChange
          value={stock.change}
          percentChange={stock.changePercent}
          currencySymbol="$"
          size="sm"
        />
      </div>
    </div>
  );
}

export function MinerCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-4 w-12 rounded bg-surface-elevated animate-pulse" />
          <div className="mt-1.5 h-3 w-28 rounded bg-surface-elevated animate-pulse" />
        </div>
        <div className="h-9 w-[72px] rounded bg-surface-elevated animate-pulse" />
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="h-5 w-16 rounded bg-surface-elevated animate-pulse" />
        <div className="h-4 w-20 rounded bg-surface-elevated animate-pulse" />
      </div>
    </div>
  );
}
