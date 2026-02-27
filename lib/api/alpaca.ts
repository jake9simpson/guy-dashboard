import { ALPACA_DATA_BASE_URL, MINING_STOCKS } from '@/lib/constants';
import type { StockQuote } from '@/lib/types';

const API_KEY = process.env.ALPACA_API_KEY ?? '';
const API_SECRET = process.env.ALPACA_API_SECRET ?? '';

interface AlpacaBar {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  t: string; // timestamp
}

interface AlpacaSnapshot {
  dailyBar: AlpacaBar;
  prevDailyBar: AlpacaBar;
  latestTrade: { p: number; t: string };
  latestQuote: { ap: number; bp: number };
}

async function fetchAlpaca<T>(path: string): Promise<T> {
  const res = await fetch(`${ALPACA_DATA_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      'APCA-API-KEY-ID': API_KEY,
      'APCA-API-SECRET-KEY': API_SECRET,
    },
  });

  if (!res.ok) {
    throw new Error(`Alpaca API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

function snapshotToQuote(symbol: string, snap: AlpacaSnapshot): StockQuote {
  const stock = MINING_STOCKS.find((s) => s.symbol === symbol);
  const price = snap.latestTrade.p;
  const prevClose = snap.prevDailyBar.c;

  return {
    symbol,
    name: stock?.name ?? symbol,
    price,
    change: parseFloat((price - prevClose).toFixed(2)),
    changePercent: parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)),
    open: snap.dailyBar.o,
    high: snap.dailyBar.h,
    low: snap.dailyBar.l,
    volume: snap.dailyBar.v,
    previousClose: prevClose,
  };
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const snap = await fetchAlpaca<AlpacaSnapshot>(
    `/stocks/${symbol}/snapshot`
  );
  return snapshotToQuote(symbol, snap);
}

export async function getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const joined = symbols.join(',');
  const data = await fetchAlpaca<Record<string, AlpacaSnapshot>>(
    `/stocks/snapshots?symbols=${joined}`
  );

  return symbols
    .filter((s) => s in data)
    .map((s) => snapshotToQuote(s, data[s]));
}
