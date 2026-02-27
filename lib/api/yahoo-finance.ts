import { getCached, setCache } from '@/lib/cache';
import type { TimeSeries, Quote } from '@/lib/types';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// XAU/USD → GC=F (gold futures), XAG/USD → SI=F (silver futures)
function mapSymbol(symbol: string): string {
  if (symbol.includes('XAU')) return 'GC=F';
  if (symbol.includes('XAG')) return 'SI=F';
  return symbol;
}

// Map timeframe value directly to Yahoo interval + range
function mapIntervalAndRange(timeframeValue: string): { yahooInterval: string; range: string } {
  switch (timeframeValue) {
    case '1day':   return { yahooInterval: '5m',  range: '1d' };
    case '1week':  return { yahooInterval: '15m', range: '5d' };
    case '1month': return { yahooInterval: '60m', range: '1mo' };
    case '3month': return { yahooInterval: '1d',  range: '3mo' };
    case '6month': return { yahooInterval: '1d',  range: '6mo' };
    case '1year':  return { yahooInterval: '1d',  range: '1y' };
    case '5year':  return { yahooInterval: '1wk', range: '5y' };
    case 'all':    return { yahooInterval: '1mo', range: 'max' };
    default:       return { yahooInterval: '1d',  range: '6mo' };
  }
}

interface YahooChartResult {
  meta: {
    symbol: string;
    regularMarketPrice: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    chartPreviousClose: number;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      close: (number | null)[];
      volume: (number | null)[];
    }>;
  };
}

async function fetchYahoo(yahooSymbol: string, interval: string, range: string): Promise<YahooChartResult> {
  const url = `${YAHOO_BASE}/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) {
    throw new Error(`Yahoo Finance returned no data for ${yahooSymbol}`);
  }

  return result as YahooChartResult;
}

export async function getQuote(symbol: string): Promise<Quote> {
  const cacheKey = `quote:${symbol}`;
  const cached = getCached<Quote>(cacheKey);
  if (cached) return cached;

  const yahooSymbol = mapSymbol(symbol);
  // Fetch 2 days of daily data so we get today's candle + yesterday's close
  const chart = await fetchYahoo(yahooSymbol, '1d', '5d');

  const meta = chart.meta;
  const q = chart.indicators.quote[0];
  const lastIdx = chart.timestamp.length - 1;

  const close = meta.regularMarketPrice;
  const open = q.open[lastIdx] ?? close;
  const high = meta.regularMarketDayHigh ?? close;
  const low = meta.regularMarketDayLow ?? close;
  // Previous close: use the close from the bar before last, or chartPreviousClose
  const previousClose = lastIdx > 0
    ? (q.close[lastIdx - 1] ?? meta.chartPreviousClose)
    : meta.chartPreviousClose;
  const change = close - previousClose;
  const percentChange = previousClose > 0 ? (change / previousClose) * 100 : 0;

  const result: Quote = {
    symbol,
    name: symbol === 'XAU/USD' ? 'Gold Spot' : symbol === 'XAG/USD' ? 'Silver Spot' : symbol,
    exchange: 'COMEX',
    datetime: new Date().toISOString(),
    open: String(open),
    high: String(high),
    low: String(low),
    close: String(close),
    volume: String(meta.regularMarketVolume ?? 0),
    previous_close: String(previousClose),
    change: change.toFixed(2),
    percent_change: percentChange.toFixed(2),
  };

  setCache(cacheKey, result, 5_000); // 5-second TTL
  return result;
}

export async function getTimeSeries(
  symbol: string,
  interval: string,
  outputsize: number,
  timeframeValue: string = ''
): Promise<TimeSeries> {
  const cacheKey = `ts:${symbol}:${timeframeValue || interval}`;
  const cached = getCached<TimeSeries>(cacheKey);
  if (cached) return cached;

  const yahooSymbol = mapSymbol(symbol);
  const { yahooInterval, range } = timeframeValue
    ? mapIntervalAndRange(timeframeValue)
    : mapIntervalAndRange(interval); // fallback for any callers without timeframe
  const chart = await fetchYahoo(yahooSymbol, yahooInterval, range);

  const q = chart.indicators.quote[0];

  const values = chart.timestamp
    .map((t, i) => {
      const o = q.open[i];
      const h = q.high[i];
      const l = q.low[i];
      const c = q.close[i];
      // Skip bars with null values (market closed / no data)
      if (o == null || h == null || l == null || c == null) return null;
      return {
        datetime: new Date(t * 1000).toISOString().replace('T', ' ').slice(0, 19),
        open: String(o),
        high: String(h),
        low: String(l),
        close: String(c),
        volume: String(q.volume[i] ?? 0),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const base = symbol.split('/')[0];
  const result: TimeSeries = {
    meta: { symbol, interval, currency_base: base, currency_quote: 'USD', type: 'Physical Currency' },
    values,
    status: 'ok',
  };

  setCache(cacheKey, result, 5 * 60_000); // 5-minute TTL
  return result;
}
