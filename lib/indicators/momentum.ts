import type { OHLCV, LineData } from '@/lib/types';

/**
 * Rate of Change (ROC) momentum indicator.
 * ROC = ((close - close_n_periods_ago) / close_n_periods_ago) * 100
 */
export function computeMomentum(data: OHLCV[], period: number = 10): LineData[] {
  const values: LineData[] = [];

  for (let i = period; i < data.length; i++) {
    const prevClose = data[i - period].close;
    if (prevClose === 0) continue;

    const roc = ((data[i].close - prevClose) / prevClose) * 100;
    values.push({
      time: new Date(data[i].time * 1000).toISOString().slice(0, 16).replace('T', ' '),
      value: roc,
    });
  }

  return values;
}
