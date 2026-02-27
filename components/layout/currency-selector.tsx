'use client';

import { usePriceStore } from '@/stores/price-store';
import { CURRENCIES } from '@/lib/constants';
import type { Currency } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  className?: string;
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const currency = usePriceStore((s) => s.currency);
  const setCurrency = usePriceStore((s) => s.setCurrency);

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className={cn(
        'appearance-none rounded-lg border border-border bg-surface px-3 py-1.5',
        'text-sm font-medium text-text-primary',
        'cursor-pointer outline-none',
        'hover:border-gold-light focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30',
        'transition-colors duration-150',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239C9690%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E")] bg-[length:12px] bg-[right_8px_center] bg-no-repeat pr-7',
        className
      )}
    >
      {CURRENCIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.symbol} {c.value}
        </option>
      ))}
    </select>
  );
}
