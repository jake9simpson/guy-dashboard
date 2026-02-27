import type { Timeframe, Currency, StockQuote } from './types';

// API configuration
export const FINNHUB_BASE_URL = 'https://finnhub.io';
export const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
export const ALPACA_DATA_BASE_URL = 'https://data.alpaca.markets/v2';
export const METALS_DEV_BASE_URL = 'https://api.metals.dev/v1';

// Symbols
export const GOLD_SYMBOL = 'XAU/USD';
export const SILVER_SYMBOL = 'XAG/USD';

// Mining stocks
export const MINING_STOCKS = [
  { symbol: 'GDX', name: 'VanEck Gold Miners ETF' },
  { symbol: 'GDXJ', name: 'VanEck Junior Gold Miners ETF' },
  { symbol: 'NEM', name: 'Newmont Corporation' },
  { symbol: 'GOLD', name: 'Barrick Gold' },
  { symbol: 'AEM', name: 'Agnico Eagle Mines' },
  { symbol: 'WPM', name: 'Wheaton Precious Metals' },
] as const;

// Timeframes for chart
export const TIMEFRAMES: Timeframe[] = [
  { label: '1D', value: '1day', interval: '5min', outputsize: 200 },
  { label: '1W', value: '1week', interval: '15min', outputsize: 250 },
  { label: '1M', value: '1month', interval: '1h', outputsize: 250 },
  { label: '3M', value: '3month', interval: '1day', outputsize: 250 },
  { label: '6M', value: '6month', interval: '1day', outputsize: 250 },
  { label: '1Y', value: '1year', interval: '1day', outputsize: 365 },
  { label: '5Y', value: '5year', interval: '1week', outputsize: 260 },
  { label: 'ALL', value: 'all', interval: '1month', outputsize: 500 },
];

// Currencies
export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

// Technical analysis defaults
export const SMA_PERIODS = [20, 50, 100, 200] as const;
export const EMA_PERIODS = [12, 26] as const;
export const RSI_PERIOD = 14;
export const RSI_OVERBOUGHT = 70;
export const RSI_OVERSOLD = 30;
export const MACD_FAST = 12;
export const MACD_SLOW = 26;
export const MACD_SIGNAL = 9;
export const BOLLINGER_PERIOD = 20;
export const BOLLINGER_STD_DEV = 2;
export const MOMENTUM_PERIOD = 10;

// Troy ounce conversions
export const TROY_OZ_TO_GRAMS = 31.1035;
export const TROY_OZ_TO_KG = 0.0311035;

// Cache durations (ms)
export const CACHE_INTRADAY = 5 * 60 * 1000; // 5 min
export const CACHE_DAILY = 60 * 60 * 1000; // 1 hour
export const CACHE_STOCKS_MARKET_HOURS = 5 * 60 * 1000; // 5 min
export const CACHE_STOCKS_AFTER_HOURS = 60 * 60 * 1000; // 1 hour

// Polling config (replaces WebSocket)
export const POLL_INTERVAL_MS = 2000;

// Design tokens
export const COLORS = {
  gold: {
    primary: '#B8860B',
    light: '#DAA520',
    bright: '#FFD700',
    subtle: '#FDF8ED',
    gradient: 'linear-gradient(135deg, #B8860B, #DAA520, #FFD700)',
  },
  silver: {
    primary: '#8A8D8F',
    light: '#C0C0C0',
  },
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F3EF',
  border: '#E8E4DC',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6560',
    muted: '#9C9690',
  },
  up: '#16A34A',
  down: '#DC2626',
} as const;
