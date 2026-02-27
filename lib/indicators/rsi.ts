import type { OHLCV, LineData, RSIData } from '@/lib/types';
import { RSI_OVERBOUGHT, RSI_OVERSOLD } from '@/lib/constants';

export function computeRSI(data: OHLCV[], period: number = 14): RSIData {
  const values: LineData[] = [];

  if (data.length < period + 1) {
    return { period, values, currentValue: 50, isOverbought: false, isOversold: false };
  }

  // Calculate initial gains/losses
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);

  values.push({
    time: new Date(data[period].time * 1000).toISOString().slice(0, 16).replace('T', ' '),
    value: rsi,
  });

  // Subsequent values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] >= 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);

    values.push({
      time: new Date(data[i + 1].time * 1000).toISOString().slice(0, 16).replace('T', ' '),
      value: rsi,
    });
  }

  const currentValue = values.length > 0 ? values[values.length - 1].value : 50;

  return {
    period,
    values,
    currentValue,
    isOverbought: currentValue >= RSI_OVERBOUGHT,
    isOversold: currentValue <= RSI_OVERSOLD,
  };
}
