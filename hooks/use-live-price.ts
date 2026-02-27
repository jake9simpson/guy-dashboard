'use client';

import { useEffect } from 'react';
import { usePriceStore } from '@/stores/price-store';
import { useWebSocket } from './use-websocket';
import { GOLD_SYMBOL, SILVER_SYMBOL } from '@/lib/constants';
import type { TwelveDataQuote } from '@/lib/types';

async function fetchQuote(symbol: string): Promise<TwelveDataQuote> {
  const res = await fetch(`/api/metals/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
  return res.json();
}

export function useLivePrice() {
  const { connected } = useWebSocket();
  const gold = usePriceStore((s) => s.gold);
  const silver = usePriceStore((s) => s.silver);
  const ratio = usePriceStore((s) => s.ratio);
  const updateGold = usePriceStore((s) => s.updateGold);
  const updateSilver = usePriceStore((s) => s.updateSilver);

  // Fetch initial REST quotes on mount
  useEffect(() => {
    async function loadInitialPrices() {
      try {
        const [goldQuote, silverQuote] = await Promise.all([
          fetchQuote(GOLD_SYMBOL),
          fetchQuote(SILVER_SYMBOL),
        ]);

        updateGold({
          symbol: GOLD_SYMBOL,
          price: parseFloat(goldQuote.close),
          change: parseFloat(goldQuote.change),
          changePercent: parseFloat(goldQuote.percent_change),
          high: parseFloat(goldQuote.high),
          low: parseFloat(goldQuote.low),
          open: parseFloat(goldQuote.open),
          previousClose: parseFloat(goldQuote.previous_close),
          timestamp: Date.now(),
        });

        updateSilver({
          symbol: SILVER_SYMBOL,
          price: parseFloat(silverQuote.close),
          change: parseFloat(silverQuote.change),
          changePercent: parseFloat(silverQuote.percent_change),
          high: parseFloat(silverQuote.high),
          low: parseFloat(silverQuote.low),
          open: parseFloat(silverQuote.open),
          previousClose: parseFloat(silverQuote.previous_close),
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Failed to fetch initial prices:', err);
      }
    }

    loadInitialPrices();
  }, [updateGold, updateSilver]);

  return { gold, silver, ratio, connected };
}
