'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { MarketStatus } from '@/components/common/market-status';
import { CurrencySelector } from '@/components/layout/currency-selector';

export function Header() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(formatDate(new Date()));
  }, []);

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Title and date */}
          <div className="flex items-center gap-4">
            <h1 className="text-gold-gradient text-xl sm:text-2xl font-bold tracking-tight">
              The Guy Report
            </h1>
            <div className="hidden sm:block h-5 w-px bg-border" />
            <p className="hidden sm:block text-sm text-text-muted">
              {date}
            </p>
          </div>

          {/* Right: Market status and currency selector */}
          <div className="flex items-center gap-4">
            <MarketStatus className="hidden sm:flex" />
            <CurrencySelector />
          </div>
        </div>
      </div>
    </header>
  );
}
