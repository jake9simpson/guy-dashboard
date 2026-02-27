'use client';

import { useQuery } from '@tanstack/react-query';
import { TIMEFRAMES } from '@/lib/constants';
import { getTimeframeStaleTime } from '@/lib/utils';
import type { OHLCV, TimeSeries } from '@/lib/types';

async function fetchHistoricalData(
  symbol: string,
  interval: string,
  outputsize: number,
  timeframe: string
): Promise<OHLCV[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    outputsize: String(outputsize),
    timeframe,
  });

  const res = await fetch(`/api/metals/historical?${params}`);
  if (!res.ok) throw new Error(`Historical data fetch failed: ${res.status}`);

  const data: TimeSeries = await res.json();

  if (!data.values || data.values.length === 0) {
    return [];
  }

  // Transform to OHLCV sorted ascending by time
  return data.values
    .map((v) => ({
      time: Math.floor(new Date(v.datetime).getTime() / 1000),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: v.volume ? parseFloat(v.volume) : 0,
    }))
    .sort((a, b) => a.time - b.time);
}

export function useHistoricalData(symbol: string, timeframeValue: string) {
  const timeframe = TIMEFRAMES.find((t) => t.value === timeframeValue) ?? TIMEFRAMES[0];

  return useQuery({
    queryKey: ['historical', symbol, timeframe.value],
    queryFn: () => fetchHistoricalData(symbol, timeframe.interval, timeframe.outputsize, timeframe.value),
    staleTime: getTimeframeStaleTime(timeframe.interval),
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
