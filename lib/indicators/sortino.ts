import type { OHLCV } from '@/lib/types';

/**
 * Compute annualized Sortino ratio from OHLCV data.
 * Like Sharpe but only penalizes downside deviation.
 */
export function computeSortino(data: OHLCV[], riskFreeRate: number = 0.05): number {
  if (data.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].close > 0) {
      returns.push(Math.log(data[i].close / data[i - 1].close));
    }
  }

  if (returns.length === 0) return 0;

  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Downside deviation: only negative returns
  const dailyRfr = riskFreeRate / 252;
  const downsideReturns = returns.filter((r) => r < dailyRfr);

  if (downsideReturns.length === 0) return 0;

  const downsideVariance =
    downsideReturns.reduce((sum, r) => sum + (r - dailyRfr) ** 2, 0) / returns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);

  if (downsideDeviation === 0) return 0;

  const annualizedReturn = meanReturn * 252;
  const annualizedDownside = downsideDeviation * Math.sqrt(252);

  return (annualizedReturn - riskFreeRate) / annualizedDownside;
}
