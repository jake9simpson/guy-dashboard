import type { OHLCV, StockQuote } from './types';

// Realistic gold price data for demo mode (when no API key is configured)
export function generateMockGoldData(days: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = 2847;
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;

  for (let i = days; i >= 0; i--) {
    const time = now - i * daySeconds;
    const change = (Math.random() - 0.48) * 30; // slight upward bias
    price = Math.max(2400, Math.min(3000, price + change));
    const high = price + Math.random() * 15;
    const low = price - Math.random() * 15;
    const open = price + (Math.random() - 0.5) * 10;

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 200000 + 50000),
    });
  }
  return data;
}

export function generateMockSilverData(days: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = 31.5;
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;

  for (let i = days; i >= 0; i--) {
    const time = now - i * daySeconds;
    const change = (Math.random() - 0.47) * 0.8;
    price = Math.max(22, Math.min(38, price + change));
    const high = price + Math.random() * 0.5;
    const low = price - Math.random() * 0.5;
    const open = price + (Math.random() - 0.5) * 0.3;

    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 500000 + 100000),
    });
  }
  return data;
}

export const MOCK_GOLD_QUOTE = {
  symbol: 'XAU/USD',
  name: 'Gold Spot',
  exchange: 'FOREX',
  datetime: new Date().toISOString(),
  open: '2835.20',
  high: '2851.40',
  low: '2832.10',
  close: '2847.30',
  volume: '0',
  previous_close: '2834.90',
  change: '12.40',
  percent_change: '0.44',
};

export const MOCK_SILVER_QUOTE = {
  symbol: 'XAG/USD',
  name: 'Silver Spot',
  exchange: 'FOREX',
  datetime: new Date().toISOString(),
  open: '31.28',
  high: '31.72',
  low: '31.18',
  close: '31.56',
  volume: '0',
  previous_close: '31.33',
  change: '0.23',
  percent_change: '0.73',
};

export const MOCK_MINING_STOCKS: StockQuote[] = [
  { symbol: 'GDX', name: 'VanEck Gold Miners ETF', price: 42.30, change: 0.50, changePercent: 1.20, open: 41.90, high: 42.55, low: 41.75, volume: 12500000, previousClose: 41.80 },
  { symbol: 'GDXJ', name: 'VanEck Junior Gold Miners ETF', price: 52.18, change: 0.82, changePercent: 1.60, open: 51.50, high: 52.40, low: 51.30, volume: 5200000, previousClose: 51.36 },
  { symbol: 'NEM', name: 'Newmont Corporation', price: 58.12, change: 0.45, changePercent: 0.78, open: 57.80, high: 58.35, low: 57.60, volume: 8700000, previousClose: 57.67 },
  { symbol: 'GOLD', name: 'Barrick Gold', price: 21.45, change: -0.06, changePercent: -0.28, open: 21.55, high: 21.68, low: 21.35, volume: 9100000, previousClose: 21.51 },
  { symbol: 'AEM', name: 'Agnico Eagle Mines', price: 87.92, change: 1.15, changePercent: 1.33, open: 87.00, high: 88.10, low: 86.85, volume: 3400000, previousClose: 86.77 },
  { symbol: 'WPM', name: 'Wheaton Precious Metals', price: 63.78, change: 0.92, changePercent: 1.46, open: 63.00, high: 64.05, low: 62.80, volume: 2800000, previousClose: 62.86 },
];

export function isDemoMode(): boolean {
  const key = process.env.TWELVE_DATA_API_KEY;
  return !key || key === 'your_key_here';
}
