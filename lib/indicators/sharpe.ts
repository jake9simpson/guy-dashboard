import type { OHLCV } from '@/lib/types';

/**
 * Compute annualized Sharpe ratio from OHLCV data.
 * Uses daily log returns. Risk-free rate is annualized (e.g., 0.05 for 5%).
 */
export function computeSharpe(data: OHLCV[], riskFreeRate: number = 0.05): number {
  if (data.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].close > 0) {
      returns.push(Math.log(data[i].close / data[i - 1].close));
    }
  }

  if (returns.length === 0) return 0;

  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Annualize: assume 252 trading days
  const annualizedReturn = meanReturn * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}
