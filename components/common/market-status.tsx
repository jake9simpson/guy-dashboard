'use client';

import { useEffect, useState } from 'react';
import { isMarketOpen } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MarketStatusProps {
  className?: string;
}

export function MarketStatus({ className }: MarketStatusProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isMarketOpen());
    const interval = setInterval(() => setOpen(isMarketOpen()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          open ? 'bg-up pulse-live' : 'bg-text-muted'
        )}
      />
      <span className={cn('text-sm font-medium', open ? 'text-up' : 'text-text-muted')}>
        {open ? 'Market Open' : 'Market Closed'}
      </span>
    </div>
  );
}
