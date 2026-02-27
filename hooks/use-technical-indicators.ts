'use client';

import { useMemo } from 'react';
import type {
  OHLCV,
  SMAData,
  EMAData,
  RSIData,
  MACDData,
  BollingerBandsData,
  LineData,
  RiskMetrics,
} from '@/lib/types';
import { computeSMA } from '@/lib/indicators/sma';
import { computeEMA } from '@/lib/indicators/ema';
import { computeRSI } from '@/lib/indicators/rsi';
import { computeMACD } from '@/lib/indicators/macd';
import { computeBollinger } from '@/lib/indicators/bollinger';
import { computeSharpe } from '@/lib/indicators/sharpe';
import { computeSortino } from '@/lib/indicators/sortino';
import { computeMomentum } from '@/lib/indicators/momentum';
import {
  SMA_PERIODS,
  EMA_PERIODS,
  RSI_PERIOD,
  MACD_FAST,
  MACD_SLOW,
  MACD_SIGNAL,
  BOLLINGER_PERIOD,
  BOLLINGER_STD_DEV,
  MOMENTUM_PERIOD,
} from '@/lib/constants';

export interface TechnicalIndicators {
  sma: SMAData[];
  ema: EMAData[];
  rsi: RSIData;
  macd: MACDData;
  bollinger: BollingerBandsData;
  momentum: LineData[];
  risk: RiskMetrics;
}

export function useTechnicalIndicators(data: OHLCV[] | undefined): TechnicalIndicators | null {
  return useMemo(() => {
    if (!data || data.length === 0) return null;

    const sma = SMA_PERIODS.map((period) => computeSMA(data, period));
    const ema = EMA_PERIODS.map((period) => computeEMA(data, period));
    const rsi = computeRSI(data, RSI_PERIOD);
    const macd = computeMACD(data, MACD_FAST, MACD_SLOW, MACD_SIGNAL);
    const bollinger = computeBollinger(data, BOLLINGER_PERIOD, BOLLINGER_STD_DEV);
    const momentum = computeMomentum(data, MOMENTUM_PERIOD);
    const sharpeRatio = computeSharpe(data);
    const sortinoRatio = computeSortino(data);

    // Max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    for (const bar of data) {
      if (bar.close > peak) peak = bar.close;
      const drawdown = peak > 0 ? (peak - bar.close) / peak : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // 30-day annualized volatility
    const recent30 = data.slice(-30);
    let volatility30d = 0;
    if (recent30.length > 1) {
      const returns: number[] = [];
      for (let i = 1; i < recent30.length; i++) {
        if (recent30[i - 1].close > 0) {
          returns.push(Math.log(recent30[i].close / recent30[i - 1].close));
        }
      }
      if (returns.length > 0) {
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
        volatility30d = Math.sqrt(variance) * Math.sqrt(252);
      }
    }

    return {
      sma,
      ema,
      rsi,
      macd,
      bollinger,
      momentum,
      risk: {
        sharpeRatio,
        sortinoRatio,
        maxDrawdown,
        volatility30d,
      },
    };
  }, [data]);
}
