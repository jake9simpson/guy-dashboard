// Price data types
export interface Price {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface OHLCV {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlestickData {
  time: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LineData {
  time: string;
  value: number;
}

// WebSocket types
export interface WebSocketMessage {
  event: string;
  symbol?: string;
  price?: number;
  timestamp?: number;
  day_volume?: number;
}

export interface WebSocketSubscription {
  action: 'subscribe' | 'unsubscribe';
  params: {
    symbols: string;
  };
}

// API response types
export interface TimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency_base: string;
    currency_quote: string;
    type: string;
  };
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
  status: string;
}

export interface Quote {
  symbol: string;
  name: string;
  exchange: string;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
}

// Technical indicator types
export interface SMAData {
  period: number;
  values: LineData[];
  currentValue: number;
}

export interface EMAData {
  period: number;
  values: LineData[];
  currentValue: number;
}

export interface RSIData {
  period: number;
  values: LineData[];
  currentValue: number;
  isOverbought: boolean;
  isOversold: boolean;
}

export interface MACDData {
  macdLine: LineData[];
  signalLine: LineData[];
  histogram: LineData[];
  currentMACD: number;
  currentSignal: number;
  currentHistogram: number;
  signal: 'bullish' | 'bearish' | 'neutral';
}

export interface BollingerBandsData {
  upper: LineData[];
  middle: LineData[];
  lower: LineData[];
  bandwidth: number;
}

export interface PerformanceMetric {
  period: string;
  gold: number;
  silver: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility30d: number;
}

export interface MovingAverageSignal {
  period: number;
  value: number;
  priceRelation: 'above' | 'below';
  percentDiff: number;
}

// Chart configuration
export type ChartType = 'candlestick' | 'line' | 'area';
export type MetalSymbol = 'XAU/USD' | 'XAG/USD';
export type ChartView = 'gold' | 'silver' | 'ratio';

export interface Timeframe {
  label: string;
  value: string;
  interval: string;
  outputsize: number;
}

// Price store types
export interface PriceState {
  gold: Price | null;
  silver: Price | null;
  ratio: number | null;
  connected: boolean;
  updateGold: (price: Partial<Price>) => void;
  updateSilver: (price: Partial<Price>) => void;
  setConnected: (connected: boolean) => void;
}
