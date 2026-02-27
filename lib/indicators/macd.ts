import type { OHLCV, LineData, MACDData } from '@/lib/types';

function emaFromCloses(closes: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  if (closes.length < period) return result;

  // Seed with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += closes[i];
    result.push(0); // placeholder for pre-period values
  }
  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
}

export function computeMACD(
  data: OHLCV[],
  fast: number = 12,
  slow: number = 26,
  signal: number = 9
): MACDData {
  const macdLine: LineData[] = [];
  const signalLine: LineData[] = [];
  const histogram: LineData[] = [];

  if (data.length < slow + signal) {
    return {
      macdLine,
      signalLine,
      histogram,
      currentMACD: 0,
      currentSignal: 0,
      currentHistogram: 0,
      signal: 'neutral',
    };
  }

  const closes = data.map((d) => d.close);
  const fastEma = emaFromCloses(closes, fast);
  const slowEma = emaFromCloses(closes, slow);

  // MACD line = Fast EMA - Slow EMA (starting from index slow-1)
  const macdValues: number[] = [];
  for (let i = slow - 1; i < closes.length; i++) {
    macdValues.push(fastEma[i] - slowEma[i]);
  }

  // Signal line = EMA of MACD line
  const signalEma: number[] = [];
  const signalMultiplier = 2 / (signal + 1);

  if (macdValues.length >= signal) {
    let sum = 0;
    for (let i = 0; i < signal; i++) {
      sum += macdValues[i];
    }
    let ema = sum / signal;
    signalEma.push(ema);

    for (let i = signal; i < macdValues.length; i++) {
      ema = (macdValues[i] - ema) * signalMultiplier + ema;
      signalEma.push(ema);
    }
  }

  // Build output starting from where signal line begins
  const startIndex = slow - 1 + signal - 1;
  for (let i = 0; i < signalEma.length; i++) {
    const dataIndex = startIndex + i;
    const time = new Date(data[dataIndex].time * 1000).toISOString().slice(0, 16).replace('T', ' ');
    const macdVal = macdValues[signal - 1 + i];
    const signalVal = signalEma[i];
    const histVal = macdVal - signalVal;

    macdLine.push({ time, value: macdVal });
    signalLine.push({ time, value: signalVal });
    histogram.push({ time, value: histVal });
  }

  const currentMACD = macdLine.length > 0 ? macdLine[macdLine.length - 1].value : 0;
  const currentSignal = signalLine.length > 0 ? signalLine[signalLine.length - 1].value : 0;
  const currentHistogram = histogram.length > 0 ? histogram[histogram.length - 1].value : 0;

  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (histogram.length >= 2) {
    const prev = histogram[histogram.length - 2].value;
    const curr = currentHistogram;
    if (curr > 0 && prev <= 0) signalType = 'bullish';
    else if (curr < 0 && prev >= 0) signalType = 'bearish';
    else if (curr > prev) signalType = 'bullish';
    else if (curr < prev) signalType = 'bearish';
  }

  return {
    macdLine,
    signalLine,
    histogram,
    currentMACD,
    currentSignal,
    currentHistogram,
    signal: signalType,
  };
}
