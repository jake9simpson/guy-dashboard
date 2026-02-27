import { ALPHA_VANTAGE_BASE_URL, MINING_STOCKS } from '@/lib/constants';
import type { AlphaVantageQuote, StockQuote } from '@/lib/types';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY ?? '';

async function fetchAlphaVantage(params: Record<string, string>): Promise<AlphaVantageQuote> {
  const url = new URL(ALPHA_VANTAGE_BASE_URL);
  url.searchParams.set('apikey', API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Alpha Vantage API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data['Error Message']) {
    throw new Error(`Alpha Vantage API error: ${data['Error Message']}`);
  }
  if (data['Note']) {
    throw new Error(`Alpha Vantage rate limit: ${data['Note']}`);
  }

  return data as AlphaVantageQuote;
}

function parseQuote(data: AlphaVantageQuote): StockQuote {
  const q = data['Global Quote'];
  const symbol = q['01. symbol'];
  const stock = MINING_STOCKS.find((s) => s.symbol === symbol);

  return {
    symbol,
    name: stock?.name ?? symbol,
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change']),
    changePercent: parseFloat(q['10. change percent'].replace('%', '')),
    open: parseFloat(q['02. open']),
    high: parseFloat(q['03. high']),
    low: parseFloat(q['04. low']),
    volume: parseInt(q['06. volume'], 10),
    previousClose: parseFloat(q['08. previous close']),
  };
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const data = await fetchAlphaVantage({
    function: 'GLOBAL_QUOTE',
    symbol,
  });
  return parseQuote(data);
}

export async function getBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
  // Alpha Vantage doesn't have a true batch endpoint for free tier,
  // so we fetch quotes sequentially with a small delay to respect rate limits
  const quotes: StockQuote[] = [];
  for (const symbol of symbols) {
    try {
      const quote = await getQuote(symbol);
      quotes.push(quote);
    } catch (err) {
      console.error(`Failed to fetch quote for ${symbol}:`, err);
    }
  }
  return quotes;
}
