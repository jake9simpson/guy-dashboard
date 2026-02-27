import { METALS_DEV_BASE_URL } from '@/lib/constants';
import type { Price } from '@/lib/types';

const API_KEY = process.env.METALS_DEV_API_KEY ?? '';

interface MetalsDevResponse {
  status: string;
  currency: string;
  unit: string;
  metals: {
    gold: number;
    silver: number;
    platinum: number;
    palladium: number;
  };
  timestamps: {
    metal: string;
    currency: string;
  };
}

export async function getLatestPrices(): Promise<{ gold: Price; silver: Price }> {
  const url = new URL('/v1/latest', METALS_DEV_BASE_URL);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('unit', 'toz');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Metals.dev API error: ${res.status} ${res.statusText}`);
  }

  const data: MetalsDevResponse = await res.json();
  const now = Date.now();

  return {
    gold: {
      symbol: 'XAU/USD',
      price: data.metals.gold,
      change: 0,
      changePercent: 0,
      high: data.metals.gold,
      low: data.metals.gold,
      open: data.metals.gold,
      previousClose: data.metals.gold,
      timestamp: now,
    },
    silver: {
      symbol: 'XAG/USD',
      price: data.metals.silver,
      change: 0,
      changePercent: 0,
      high: data.metals.silver,
      low: data.metals.silver,
      open: data.metals.silver,
      previousClose: data.metals.silver,
      timestamp: now,
    },
  };
}
