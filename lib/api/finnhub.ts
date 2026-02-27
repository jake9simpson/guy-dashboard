import { FINNHUB_BASE_URL } from '@/lib/constants';
import { getCached, setCache } from '@/lib/cache';
import type { TwelveDataTimeSeries, TwelveDataQuote } from '@/lib/types';

const API_KEY = process.env.FINNHUB_API_KEY ?? '';

// XAU/USD → OANDA:XAU_USD, XAG/USD → OANDA:XAG_USD
function mapSymbol(symbol: string): string {
  return `OANDA:${symbol.replace('/', '_')}`;
}

// Map Twelve Data intervals to Finnhub resolutions
function mapResolution(interval: string): string {
  const map: Record<string, string> = {
    '1min': '1', '5min': '5', '15min': '15', '30min': '30',
    '1h': '60', '1day': 'D', '1week': 'W', '1month': 'M',
  };
  return map[interval] ?? 'D';
}

// Compute the "from" timestamp based on interval + outputsize
function computeFrom(interval: string, outputsize: number): number {
  const now = Math.floor(Date.now() / 1000);
  const secondsPerBar: Record<string, number> = {
    '1min': 60, '5min': 300, '15min': 900, '30min': 1800,
    '1h': 3600, '1day': 86400, '1week': 604800, '1month': 2592000,
  };
  const barSize = secondsPerBar[interval] ?? 86400;
  // Add 20% buffer for weekends/holidays when markets are closed
  return now - Math.ceil(outputsize * barSize * 1.2);
}

async function fetchFinnhub<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, FINNHUB_BASE_URL);
  url.searchParams.set('token', API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

interface FinnhubQuote {
  c: number; d: number; dp: number; h: number; l: number; o: number; pc: number;
}

interface FinnhubCandles {
  o: number[]; h: number[]; l: number[]; c: number[]; v: number[]; t: number[]; s: string;
}

export async function getQuote(symbol: string): Promise<TwelveDataQuote> {
  const cacheKey = `quote:${symbol}`;
  const cached = getCached<TwelveDataQuote>(cacheKey);
  if (cached) return cached;

  const finnhubSymbol = mapSymbol(symbol);
  const q = await fetchFinnhub<FinnhubQuote>('/api/v1/quote', { symbol: finnhubSymbol });

  const result: TwelveDataQuote = {
    symbol,
    name: symbol === 'XAU/USD' ? 'Gold Spot' : symbol === 'XAG/USD' ? 'Silver Spot' : symbol,
    exchange: 'FOREX',
    datetime: new Date().toISOString(),
    open: String(q.o),
    high: String(q.h),
    low: String(q.l),
    close: String(q.c),
    volume: '0',
    previous_close: String(q.pc),
    change: String(q.d),
    percent_change: String(q.dp),
  };

  setCache(cacheKey, result, 5_000); // 5-second TTL
  return result;
}

export async function getTimeSeries(
  symbol: string,
  interval: string,
  outputsize: number
): Promise<TwelveDataTimeSeries> {
  const cacheKey = `ts:${symbol}:${interval}:${outputsize}`;
  const cached = getCached<TwelveDataTimeSeries>(cacheKey);
  if (cached) return cached;

  const finnhubSymbol = mapSymbol(symbol);
  const resolution = mapResolution(interval);
  const from = computeFrom(interval, outputsize);
  const to = Math.floor(Date.now() / 1000);

  const candles = await fetchFinnhub<FinnhubCandles>('/api/v1/forex/candle', {
    symbol: finnhubSymbol,
    resolution,
    from: String(from),
    to: String(to),
  });

  if (candles.s !== 'ok' || !candles.t?.length) {
    throw new Error(`Finnhub returned no data for ${symbol} (status: ${candles.s})`);
  }

  const values = candles.t.map((t, i) => ({
    datetime: new Date(t * 1000).toISOString().replace('T', ' ').slice(0, 19),
    open: String(candles.o[i]),
    high: String(candles.h[i]),
    low: String(candles.l[i]),
    close: String(candles.c[i]),
    volume: String(candles.v[i] ?? 0),
  }));

  const base = symbol.split('/')[0];
  const result: TwelveDataTimeSeries = {
    meta: { symbol, interval, currency_base: base, currency_quote: 'USD', type: 'Physical Currency' },
    values,
    status: 'ok',
  };

  setCache(cacheKey, result, 5 * 60_000); // 5-minute TTL
  return result;
}
