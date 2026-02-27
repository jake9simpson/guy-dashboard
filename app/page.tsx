'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LivePriceCard } from '@/components/prices/live-price-card';
import { UnitConverter } from '@/components/common/unit-converter';
import { MainChart } from '@/components/charts/main-chart';
import { ChartControls } from '@/components/charts/chart-controls';
import { TAIndicatorPanel } from '@/components/charts/ta-indicator-panel';
import { RatioChart } from '@/components/charts/ratio-chart';
import { TADashboard } from '@/components/analysis/ta-dashboard';
import { MovingAveragesTable } from '@/components/analysis/moving-averages-table';
import { PerformanceTable } from '@/components/analysis/performance-table';
import { RiskMetrics } from '@/components/analysis/risk-metrics';
import { MinersGrid } from '@/components/stocks/miners-grid';
import { useLivePrice } from '@/hooks/use-live-price';
import { useHistoricalData } from '@/hooks/use-historical-data';
import { useTechnicalIndicators } from '@/hooks/use-technical-indicators';
import { TIMEFRAMES, GOLD_SYMBOL, SILVER_SYMBOL, SMA_PERIODS } from '@/lib/constants';
import type {
  ChartType,
  ChartView,
  Timeframe,
  CandlestickData,
  LineData,
  MovingAverageSignal,
  PerformanceMetric,
} from '@/lib/types';

export default function Dashboard() {
  const { gold, silver, ratio } = useLivePrice();

  // Chart state
  const [timeframe, setTimeframe] = useState<Timeframe>(TIMEFRAMES[3]); // 3M default
  const [chartView, setChartView] = useState<ChartView>('gold');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);

  // Determine which symbol to fetch based on chart view
  const activeSymbol = chartView === 'silver' ? SILVER_SYMBOL : GOLD_SYMBOL;

  // Fetch historical data for both metals
  const { data: goldData, isLoading: goldLoading } = useHistoricalData(GOLD_SYMBOL, timeframe.value);
  const { data: silverData, isLoading: silverLoading } = useHistoricalData(SILVER_SYMBOL, timeframe.value);

  // Active data based on chart view
  const activeData = chartView === 'silver' ? silverData : goldData;

  // Compute technical indicators for active data
  const goldIndicators = useTechnicalIndicators(goldData);
  const silverIndicators = useTechnicalIndicators(silverData);
  const activeIndicators = chartView === 'silver' ? silverIndicators : goldIndicators;

  // Transform OHLCV to chart formats
  const candlestickData: CandlestickData[] | undefined = useMemo(() => {
    if (!activeData) return undefined;
    return activeData.map((d) => ({
      time: new Date(d.time * 1000).toISOString().split('T')[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
  }, [activeData]);

  const lineData: LineData[] | undefined = useMemo(() => {
    if (!activeData) return undefined;
    return activeData.map((d) => ({
      time: new Date(d.time * 1000).toISOString().split('T')[0],
      value: d.close,
    }));
  }, [activeData]);

  // Build overlay configs from active overlays + indicators
  const overlayConfigs = useMemo(() => {
    if (!activeIndicators) return [];
    return activeOverlays
      .map((id) => {
        if (id.startsWith('sma-')) {
          const period = parseInt(id.split('-')[1]);
          const smaData = activeIndicators.sma.find((s) => s.period === period);
          if (smaData) return { type: 'sma' as const, data: smaData };
        } else if (id.startsWith('ema-')) {
          const period = parseInt(id.split('-')[1]);
          const emaData = activeIndicators.ema.find((e) => e.period === period);
          if (emaData) return { type: 'ema' as const, data: emaData };
        } else if (id === 'bollinger') {
          return { type: 'bollinger' as const, data: activeIndicators.bollinger };
        }
        return null;
      })
      .filter(Boolean) as { type: 'sma' | 'ema' | 'bollinger'; data: unknown }[];
  }, [activeOverlays, activeIndicators]);

  // Build ratio chart data
  const ratioData: LineData[] | undefined = useMemo(() => {
    if (!goldData || !silverData) return undefined;
    const minLen = Math.min(goldData.length, silverData.length);
    return Array.from({ length: minLen }, (_, i) => ({
      time: new Date(goldData[i].time * 1000).toISOString().split('T')[0],
      value: silverData[i].close > 0 ? goldData[i].close / silverData[i].close : 0,
    }));
  }, [goldData, silverData]);

  // Build volume data for TA panel
  const volumeData = useMemo(() => {
    if (!activeData) return undefined;
    return activeData.map((d) => ({
      time: new Date(d.time * 1000).toISOString().split('T')[0],
      volume: d.volume,
    }));
  }, [activeData]);

  // Build MA signals
  const maSignals: MovingAverageSignal[] = useMemo(() => {
    if (!activeIndicators || !activeData?.length) return [];
    const currentPrice = activeData[activeData.length - 1].close;
    return activeIndicators.sma
      .filter((s) => SMA_PERIODS.includes(s.period as typeof SMA_PERIODS[number]) && s.currentValue > 0)
      .map((s) => ({
        period: s.period,
        value: s.currentValue,
        priceRelation: currentPrice >= s.currentValue ? 'above' as const : 'below' as const,
        percentDiff: s.currentValue > 0
          ? ((currentPrice - s.currentValue) / s.currentValue) * 100
          : 0,
      }));
  }, [activeIndicators, activeData]);

  // Build volatility line data for TA dashboard
  const volatilityLineData: LineData[] = useMemo(() => {
    if (!activeData || activeData.length < 2) return [];
    const result: LineData[] = [];
    for (let i = 1; i < activeData.length; i++) {
      const ret = activeData[i - 1].close > 0
        ? Math.abs(Math.log(activeData[i].close / activeData[i - 1].close)) * 100
        : 0;
      result.push({
        time: new Date(activeData[i].time * 1000).toISOString().split('T')[0],
        value: ret,
      });
    }
    return result;
  }, [activeData]);

  // Performance metrics (placeholder — computed from available data)
  const performanceMetrics: PerformanceMetric[] = useMemo(() => {
    if (!goldData?.length || !silverData?.length) return [];
    const calcReturn = (data: typeof goldData, periods: number) => {
      if (data.length < periods) return 0;
      const start = data[data.length - periods].close;
      const end = data[data.length - 1].close;
      return start > 0 ? ((end - start) / start) * 100 : 0;
    };

    const periods = [
      { period: '1D Change', count: 1 },
      { period: '1W Change', count: 5 },
      { period: '1M Change', count: 22 },
      { period: 'YTD', count: Math.min(goldData.length, 60) },
      { period: '1Y Change', count: Math.min(goldData.length, 252) },
    ];

    return periods.map(({ period, count }) => ({
      period,
      gold: calcReturn(goldData, count),
      silver: calcReturn(silverData, count),
    }));
  }, [goldData, silverData]);

  const currentPrice = activeData?.length
    ? activeData[activeData.length - 1].close
    : 0;

  const isChartLoading = chartView === 'silver' ? silverLoading : goldLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero: Live Price Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          <LivePriceCard metal="gold" />
          <LivePriceCard metal="silver" />
        </section>

        {/* Chart Controls */}
        <section className="mb-4">
          <ChartControls
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            chartView={chartView}
            onChartViewChange={setChartView}
            chartType={chartType}
            onChartTypeChange={setChartType}
            activeOverlays={activeOverlays}
            onOverlaysChange={setActiveOverlays}
          />
        </section>

        {/* Main Chart */}
        <section className="mb-2">
          {isChartLoading ? (
            <div className="h-[500px] w-full rounded-lg border border-border bg-surface animate-pulse flex items-center justify-center">
              <p className="text-text-muted text-sm">Loading chart data...</p>
            </div>
          ) : chartView === 'ratio' ? (
            <RatioChart
              data={ratioData ?? []}
              currentRatio={ratio ?? 0}
              height={500}
            />
          ) : (
            <MainChart
              candlestickData={chartType === 'candlestick' ? candlestickData : undefined}
              lineData={chartType !== 'candlestick' ? lineData : undefined}
              chartType={chartType}
              overlays={overlayConfigs as never}
              height={500}
            />
          )}
        </section>

        {/* TA Indicator Panels (RSI, MACD, Volume) */}
        {activeIndicators && (
          <section className="mb-8">
            <TAIndicatorPanel
              rsiData={activeIndicators.rsi}
              macdData={activeIndicators.macd}
              volumeData={volumeData}
            />
          </section>
        )}

        {/* Technical Analysis Dashboard */}
        {activeIndicators && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Technical Analysis
            </h2>
            <TADashboard
              rsiData={activeIndicators.rsi}
              macdData={activeIndicators.macd}
              momentumData={activeIndicators.momentum}
              volatilityData={volatilityLineData}
              volatility30d={activeIndicators.risk.volatility30d * 100}
            />
          </section>
        )}

        {/* Gold/Silver Ratio */}
        {chartView !== 'ratio' && ratioData && ratioData.length > 0 && (
          <section className="mb-8">
            <RatioChart
              data={ratioData}
              currentRatio={ratio ?? 0}
            />
          </section>
        )}

        {/* Moving Averages Summary */}
        {maSignals.length > 0 && (
          <section className="mb-8">
            <MovingAveragesTable
              currentPrice={currentPrice}
              signals={maSignals}
            />
          </section>
        )}

        {/* Performance + Risk side by side */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {performanceMetrics.length > 0 && (
            <PerformanceTable
              metrics={performanceMetrics}
              goldHigh52w={goldData?.length ? Math.max(...goldData.map((d) => d.high)) : undefined}
              goldLow52w={goldData?.length ? Math.min(...goldData.map((d) => d.low)) : undefined}
              silverHigh52w={silverData?.length ? Math.max(...silverData.map((d) => d.high)) : undefined}
              silverLow52w={silverData?.length ? Math.min(...silverData.map((d) => d.low)) : undefined}
            />
          )}

          {goldIndicators && silverIndicators && (
            <div>
              <RiskMetrics
                gold={goldIndicators.risk}
                silver={silverIndicators.risk}
              />
            </div>
          )}
        </section>

        {/* Unit Converter */}
        <section className="mb-8">
          <UnitConverter />
        </section>

        {/* Mining Stocks */}
        <section className="mb-8">
          <MinersGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}
