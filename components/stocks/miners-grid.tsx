'use client';

import { useQuery } from '@tanstack/react-query';
import { Pickaxe } from 'lucide-react';
import { MINING_STOCKS, CACHE_STOCKS_MARKET_HOURS } from '@/lib/constants';
import type { StockQuote } from '@/lib/types';
import { MinerCard, MinerCardSkeleton } from './miner-card';
import { cn } from '@/lib/utils';

async function fetchMiningStocks(): Promise<StockQuote[]> {
  const symbols = MINING_STOCKS.map((s) => s.symbol).join(',');
  const res = await fetch(`/api/stocks?symbols=${symbols}`);
  if (!res.ok) throw new Error(`Stocks fetch failed: ${res.status}`);
  return res.json();
}

interface MinersGridProps {
  className?: string;
}

export function MinersGrid({ className }: MinersGridProps) {
  const { data: stocks, isLoading, error } = useQuery({
    queryKey: ['mining-stocks'],
    queryFn: fetchMiningStocks,
    staleTime: CACHE_STOCKS_MARKET_HOURS,
    refetchInterval: CACHE_STOCKS_MARKET_HOURS,
  });

  return (
    <div className={cn('', className)}>
      <div className="mb-4 flex items-center gap-2">
        <Pickaxe className="h-5 w-5 text-gold-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Mining Stocks</h2>
      </div>

      {error && (
        <div className="rounded-lg border border-down/20 bg-down/5 p-4 text-sm text-down">
          Failed to load mining stocks. Data may be temporarily unavailable.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? MINING_STOCKS.map((s) => <MinerCardSkeleton key={s.symbol} />)
          : stocks?.map((stock) => (
              <MinerCard key={stock.symbol} stock={stock} />
            ))}
      </div>
    </div>
  );
}
