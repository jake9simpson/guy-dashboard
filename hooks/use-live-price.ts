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
      // Fetch independently so one failure doesn't block the other
      fetchQuote(GOLD_SYMBOL)
        .then((q) => {
          updateGold({
            symbol: GOLD_SYMBOL,
            price: parseFloat(q.close),
            change: parseFloat(q.change),
            changePercent: parseFloat(q.percent_change),
            high: parseFloat(q.high),
            low: parseFloat(q.low),
            open: parseFloat(q.open),
            previousClose: parseFloat(q.previous_close),
            timestamp: Date.now(),
          });
        })
        .catch((err) => console.error('Failed to fetch gold price:', err));

      fetchQuote(SILVER_SYMBOL)
        .then((q) => {
          updateSilver({
            symbol: SILVER_SYMBOL,
            price: parseFloat(q.close),
            change: parseFloat(q.change),
            changePercent: parseFloat(q.percent_change),
            high: parseFloat(q.high),
            low: parseFloat(q.low),
            open: parseFloat(q.open),
            previousClose: parseFloat(q.previous_close),
            timestamp: Date.now(),
          });
        })
        .catch((err) => console.error('Failed to fetch silver price:', err));
    }

    loadInitialPrices();
  }, [updateGold, updateSilver]);

  return { gold, silver, ratio, connected };
}
