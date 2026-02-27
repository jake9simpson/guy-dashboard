import type { OHLCV, LineData, EMAData } from '@/lib/types';

export function computeEMA(data: OHLCV[], period: number): EMAData {
  const values: LineData[] = [];
  const multiplier = 2 / (period + 1);

  if (data.length < period) {
    return { period, values, currentValue: 0 };
  }

  // Seed EMA with SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;

  values.push({
    time: new Date(data[period - 1].time * 1000).toISOString().slice(0, 16).replace('T', ' '),
    value: ema,
  });

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    values.push({
      time: new Date(data[i].time * 1000).toISOString().slice(0, 16).replace('T', ' '),
      value: ema,
    });
  }

  return {
    period,
    values,
    currentValue: values.length > 0 ? values[values.length - 1].value : 0,
  };
}
