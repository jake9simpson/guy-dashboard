import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TROY_OZ_TO_GRAMS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, decimals: number = 2): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatChange(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatPrice(value, decimals)}`;
}

export function priceToGrams(pricePerOz: number): number {
  return pricePerOz / TROY_OZ_TO_GRAMS;
}

export function priceToKg(pricePerOz: number): number {
  return pricePerOz * (1000 / TROY_OZ_TO_GRAMS);
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();

  // Forex markets: Sunday 22:00 UTC to Friday 22:00 UTC
  if (utcDay === 0 && utcHour < 22) return false; // Sunday before open
  if (utcDay === 6) return false; // Saturday
  if (utcDay === 5 && utcHour >= 22) return false; // Friday after close

  return true;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getTimeframeStaleTime(interval: string): number {
  if (['1min', '5min', '15min'].includes(interval)) {
    return 5 * 60 * 1000; // 5 minutes for intraday
  }
  return 60 * 60 * 1000; // 1 hour for daily+
}
