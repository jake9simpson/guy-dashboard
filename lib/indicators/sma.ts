import type { OHLCV, LineData, SMAData } from '@/lib/types';

export function computeSMA(data: OHLCV[], period: number): SMAData {
  const values: LineData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    values.push({
      time: new Date(data[i].time * 1000).toISOString().slice(0, 16).replace('T', ' '),
      value: sum / period,
    });
  }

  return {
    period,
    values,
    currentValue: values.length > 0 ? values[values.length - 1].value : 0,
  };
}
