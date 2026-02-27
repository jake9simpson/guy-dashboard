import type { OHLCV, LineData, BollingerBandsData } from '@/lib/types';

export function computeBollinger(
  data: OHLCV[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsData {
  const upper: LineData[] = [];
  const middle: LineData[] = [];
  const lower: LineData[] = [];

  if (data.length < period) {
    return { upper, middle, lower, bandwidth: 0 };
  }

  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const sma = sum / period;

    // Calculate standard deviation
    let sqDiffSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sqDiffSum += (data[j].close - sma) ** 2;
    }
    const sd = Math.sqrt(sqDiffSum / period);

    const time = new Date(data[i].time * 1000).toISOString().slice(0, 16).replace('T', ' ');
    const upperBand = sma + stdDev * sd;
    const lowerBand = sma - stdDev * sd;

    upper.push({ time, value: upperBand });
    middle.push({ time, value: sma });
    lower.push({ time, value: lowerBand });
  }

  // Bandwidth = (Upper - Lower) / Middle for the latest point
  const lastUpper = upper[upper.length - 1]?.value ?? 0;
  const lastMiddle = middle[middle.length - 1]?.value ?? 1;
  const lastLower = lower[lower.length - 1]?.value ?? 0;
  const bandwidth = lastMiddle !== 0 ? (lastUpper - lastLower) / lastMiddle : 0;

  return { upper, middle, lower, bandwidth };
}
