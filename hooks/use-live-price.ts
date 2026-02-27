'use client';

import { useEffect, useRef } from 'react';
import { usePriceStore } from '@/stores/price-store';
import { GOLD_SYMBOL, SILVER_SYMBOL, POLL_INTERVAL_MS } from '@/lib/constants';
import type { TwelveDataQuote } from '@/lib/types';

async function fetchQuote(symbol: string): Promise<TwelveDataQuote> {
  const res = await fetch(`/api/metals/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
  return res.json();
}

function applyQuote(
  q: TwelveDataQuote,
  symbol: string,
  update: (price: Partial<import('@/lib/types').Price>) => void
) {
  update({
    symbol,
    price: parseFloat(q.close),
    change: parseFloat(q.change),
    changePercent: parseFloat(q.percent_change),
    high: parseFloat(q.high),
    low: parseFloat(q.low),
    open: parseFloat(q.open),
    previousClose: parseFloat(q.previous_close),
    timestamp: Date.now(),
  });
}

export function useLivePrice() {
  const gold = usePriceStore((s) => s.gold);
  const silver = usePriceStore((s) => s.silver);
  const ratio = usePriceStore((s) => s.ratio);
  const connected = usePriceStore((s) => s.connected);
  const updateGold = usePriceStore((s) => s.updateGold);
  const updateSilver = usePriceStore((s) => s.updateSilver);
  const setConnected = usePriceStore((s) => s.setConnected);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [goldQ, silverQ] = await Promise.allSettled([
          fetchQuote(GOLD_SYMBOL),
          fetchQuote(SILVER_SYMBOL),
        ]);

        if (cancelled) return;

        if (goldQ.status === 'fulfilled') applyQuote(goldQ.value, GOLD_SYMBOL, updateGold);
        if (silverQ.status === 'fulfilled') applyQuote(silverQ.value, SILVER_SYMBOL, updateSilver);

        if (!cancelled) setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    // Initial fetch
    poll();

    // Start polling
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setConnected(false);
    };
  }, [updateGold, updateSilver, setConnected]);

  return { gold, silver, ratio, connected };
}
