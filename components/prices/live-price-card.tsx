'use client';

import { useEffect, useRef, useState } from 'react';
import { usePriceStore } from '@/stores/price-store';
import { formatCurrency } from '@/lib/utils';
import { PriceChange } from '@/components/common/price-change';
import { CURRENCIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Price } from '@/lib/types';

interface LivePriceCardProps {
  metal: 'gold' | 'silver';
  className?: string;
}

export function LivePriceCard({ metal, className }: LivePriceCardProps) {
  const price = usePriceStore((s) => (metal === 'gold' ? s.gold : s.silver));
  const currency = usePriceStore((s) => s.currency);
  const connected = usePriceStore((s) => s.connected);
  const [flashClass, setFlashClass] = useState('');
  const prevPrice = useRef<number | null>(null);

  const currencyInfo = CURRENCIES.find((c) => c.value === currency);
  const currencySymbol = currencyInfo?.symbol ?? '$';

  // Flash on price change
  useEffect(() => {
    if (!price?.price || prevPrice.current === null) {
      prevPrice.current = price?.price ?? null;
      return;
    }
    if (price.price !== prevPrice.current) {
      setFlashClass(
        price.price > prevPrice.current ? 'price-flash-up' : 'price-flash-down'
      );
      prevPrice.current = price.price;
      const timer = setTimeout(() => setFlashClass(''), 800);
      return () => clearTimeout(timer);
    }
  }, [price?.price]);

  const isGold = metal === 'gold';
  const label = isGold ? 'Gold' : 'Silver';
  const symbol = isGold ? 'XAU/USD' : 'XAG/USD';
  const accentColor = isGold ? 'text-gold-primary' : 'text-silver-primary';
  const accentBorder = isGold
    ? 'border-gold-primary/20 hover:border-gold-primary/40'
    : 'border-silver-primary/20 hover:border-silver-primary/40';

  return (
    <div
      className={cn(
        'rounded-xl border bg-surface p-6 shadow-sm card-hover',
        accentBorder,
        flashClass,
        className
      )}
    >
      {/* Top row: label + live indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className={cn('text-lg font-bold', accentColor)}>{label}</h2>
          <span className="text-xs text-text-muted font-mono">{symbol}</span>
        </div>
        {connected && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-up pulse-live" />
            <span className="text-xs font-medium text-up">LIVE</span>
          </div>
        )}
      </div>

      {/* Main price */}
      <div className="mb-3">
        {price ? (
          <p className="font-mono text-4xl font-bold text-text-primary tracking-tight">
            {formatCurrency(price.price, currency)}
          </p>
        ) : (
          <div className="h-10 w-48 rounded bg-surface-elevated animate-pulse" />
        )}
      </div>

      {/* Change */}
      <div className="mb-5">
        {price ? (
          <PriceChange
            value={price.change}
            percentChange={price.changePercent}
            currencySymbol={currencySymbol}
            size="md"
          />
        ) : (
          <div className="h-5 w-36 rounded bg-surface-elevated animate-pulse" />
        )}
      </div>

      {/* High / Low */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide mb-0.5">
            Day High
          </p>
          {price ? (
            <p className="font-mono text-sm font-semibold text-text-primary">
              {formatCurrency(price.high, currency)}
            </p>
          ) : (
            <div className="h-4 w-20 rounded bg-surface-elevated animate-pulse" />
          )}
        </div>
        <div>
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide mb-0.5">
            Day Low
          </p>
          {price ? (
            <p className="font-mono text-sm font-semibold text-text-primary">
              {formatCurrency(price.low, currency)}
            </p>
          ) : (
            <div className="h-4 w-20 rounded bg-surface-elevated animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
