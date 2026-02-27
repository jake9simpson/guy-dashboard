import { TWELVE_DATA_BASE_URL } from '@/lib/constants';
import type { TwelveDataTimeSeries, TwelveDataQuote } from '@/lib/types';

const API_KEY = process.env.TWELVE_DATA_API_KEY ?? '';

async function fetchTwelveData<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, TWELVE_DATA_BASE_URL);
  url.searchParams.set('apikey', API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Twelve Data API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(`Twelve Data API error: ${data.message}`);
  }

  return data as T;
}

export async function getTimeSeries(
  symbol: string,
  interval: string,
  outputsize: number
): Promise<TwelveDataTimeSeries> {
  return fetchTwelveData<TwelveDataTimeSeries>('/time_series', {
    symbol,
    interval,
    outputsize: String(outputsize),
  });
}

export async function getQuote(symbol: string): Promise<TwelveDataQuote> {
  return fetchTwelveData<TwelveDataQuote>('/quote', { symbol });
}
