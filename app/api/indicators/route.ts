import { NextRequest, NextResponse } from 'next/server';
import { getTimeSeries } from '@/lib/api/twelve-data';
import { computeSMA } from '@/lib/indicators/sma';
import { computeEMA } from '@/lib/indicators/ema';
import { computeRSI } from '@/lib/indicators/rsi';
import { computeMACD } from '@/lib/indicators/macd';
import { computeBollinger } from '@/lib/indicators/bollinger';
import { computeSharpe } from '@/lib/indicators/sharpe';
import { computeSortino } from '@/lib/indicators/sortino';
import { computeMomentum } from '@/lib/indicators/momentum';
import type { OHLCV } from '@/lib/types';
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol') ?? 'XAU/USD';
  const interval = searchParams.get('interval') ?? '1day';
  const outputsize = searchParams.get('outputsize') ?? '200';

  try {
    const timeSeries = await getTimeSeries(symbol, interval, parseInt(outputsize, 10));

    // Convert to OHLCV, sorted ascending by time
    const ohlcv: OHLCV[] = timeSeries.values
      .map((v) => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: v.volume ? parseFloat(v.volume) : 0,
      }))
      .sort((a, b) => a.time - b.time);

    const sma = SMA_PERIODS.map((period) => computeSMA(ohlcv, period));
    const ema = EMA_PERIODS.map((period) => computeEMA(ohlcv, period));
    const rsi = computeRSI(ohlcv, RSI_PERIOD);
    const macd = computeMACD(ohlcv, MACD_FAST, MACD_SLOW, MACD_SIGNAL);
    const bollinger = computeBollinger(ohlcv, BOLLINGER_PERIOD, BOLLINGER_STD_DEV);
    const sharpe = computeSharpe(ohlcv);
    const sortino = computeSortino(ohlcv);
    const momentum = computeMomentum(ohlcv, MOMENTUM_PERIOD);

    // Max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    for (const bar of ohlcv) {
      if (bar.close > peak) peak = bar.close;
      const drawdown = peak > 0 ? (peak - bar.close) / peak : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // 30-day volatility (annualized)
    const recent30 = ohlcv.slice(-30);
    let volatility30d = 0;
    if (recent30.length > 1) {
      const returns: number[] = [];
      for (let i = 1; i < recent30.length; i++) {
        if (recent30[i - 1].close > 0) {
          returns.push(Math.log(recent30[i].close / recent30[i - 1].close));
        }
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
      volatility30d = Math.sqrt(variance) * Math.sqrt(252);
    }

    return NextResponse.json(
      {
        sma,
        ema,
        rsi,
        macd,
        bollinger,
        momentum,
        risk: {
          sharpeRatio: sharpe,
          sortinoRatio: sortino,
          maxDrawdown,
          volatility30d,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to compute indicators';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
