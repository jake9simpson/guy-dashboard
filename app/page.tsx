'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LivePriceCard } from '@/components/prices/live-price-card';
import { UnitConverter } from '@/components/common/unit-converter';
import { MainChart } from '@/components/charts/main-chart';
import { ChartControls } from '@/components/charts/chart-controls';
import { RatioChart } from '@/components/charts/ratio-chart';
import { TADashboard } from '@/components/analysis/ta-dashboard';
import { MovingAveragesTable } from '@/components/analysis/moving-averages-table';
import { PerformanceTable } from '@/components/analysis/performance-table';
import { MinersGrid } from '@/components/stocks/miners-grid';
import { useLivePrice } from '@/hooks/use-live-price';
import { useHistoricalData } from '@/hooks/use-historical-data';
import { useTechnicalIndicators } from '@/hooks/use-technical-indicators';
import { computeSMA } from '@/lib/indicators/sma';
import { GOLD_SYMBOL, SILVER_SYMBOL, SMA_PERIODS } from '@/lib/constants';
import type { OverlayLine } from '@/components/charts/main-chart';
import type {
  ChartType,
  ChartView,
  CandlestickData,
  LineData,
  MovingAverageSignal,
  PerformanceMetric,
} from '@/lib/types';

export default function Dashboard() {
  const { gold, silver, ratio } = useLivePrice();

  // Chart state — hardcoded to ALL timeframe (daily bars, full history)
  const [chartView, setChartView] = useState<ChartView>('gold');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showMAs, setShowMAs] = useState(false);

  // Fetch ALL-time data for charts (monthly bars)
  const { data: goldData, isLoading: goldLoading } = useHistoricalData(GOLD_SYMBOL, 'all');
  const { data: silverData, isLoading: silverLoading } = useHistoricalData(SILVER_SYMBOL, 'all');

  // Fetch 1Y daily data for accurate performance metrics and 52-week stats
  const { data: goldYearData } = useHistoricalData(GOLD_SYMBOL, '1year');
  const { data: silverYearData } = useHistoricalData(SILVER_SYMBOL, '1year');

  // Active data based on chart view
  const activeData = chartView === 'silver' ? silverData : goldData;

  // Compute technical indicators for active data
  const goldIndicators = useTechnicalIndicators(goldData);
  const silverIndicators = useTechnicalIndicators(silverData);
  const activeIndicators = chartView === 'silver' ? silverIndicators : goldIndicators;

  // 50-day and 200-day SMA overlays on daily chart
  const maOverlays: OverlayLine[] | undefined = useMemo(() => {
    if (!showMAs || !activeData || activeData.length < 200) return undefined;
    const sma50 = computeSMA(activeData, 50);
    const sma200 = computeSMA(activeData, 200);
    return [
      {
        data: sma50.values.map((v) => ({ time: v.time.slice(0, 10), value: v.value })),
        color: 'rgba(100, 130, 160, 0.6)',
        title: '50 SMA',
      },
      {
        data: sma200.values.map((v) => ({ time: v.time.slice(0, 10), value: v.value })),
        color: 'rgba(80, 160, 120, 0.6)',
        title: '200 SMA',
      },
    ];
  }, [showMAs, activeData]);

  // Live price for the active chart view (passed separately to avoid full re-render)
  const livePrice = chartView === 'silver' ? silver?.price : gold?.price;

  // Transform OHLCV to chart formats (stable, only changes when historical data changes)
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

  // Build ratio chart data
  const ratioData: LineData[] | undefined = useMemo(() => {
    if (!goldData || !silverData) return undefined;
    const minLen = Math.min(goldData.length, silverData.length);
    return Array.from({ length: minLen }, (_, i) => ({
      time: new Date(goldData[i].time * 1000).toISOString().split('T')[0],
      value: silverData[i].close > 0 ? goldData[i].close / silverData[i].close : 0,
    }));
  }, [goldData, silverData]);

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

  // Performance metrics computed from 1Y daily data for accuracy
  const performanceMetrics: PerformanceMetric[] = useMemo(() => {
    if (!goldYearData?.length || !silverYearData?.length) return [];

    const calcReturn = (data: typeof goldYearData, periods: number) => {
      if (data.length < periods + 1) return 0;
      const start = data[data.length - 1 - periods].close;
      const end = data[data.length - 1].close;
      return start > 0 ? ((end - start) / start) * 100 : 0;
    };

    const calcYtdReturn = (data: typeof goldYearData) => {
      const now = new Date();
      const ytdTimestamp = new Date(now.getFullYear(), 0, 1).getTime() / 1000;
      const ytdBar = data.find((d) => d.time >= ytdTimestamp);
      if (!ytdBar) return 0;
      const end = data[data.length - 1].close;
      return ytdBar.close > 0 ? ((end - ytdBar.close) / ytdBar.close) * 100 : 0;
    };

    return [
      { period: '1D Change', gold: calcReturn(goldYearData, 1), silver: calcReturn(silverYearData, 1) },
      { period: '1W Change', gold: calcReturn(goldYearData, 5), silver: calcReturn(silverYearData, 5) },
      { period: '1M Change', gold: calcReturn(goldYearData, 22), silver: calcReturn(silverYearData, 22) },
      { period: 'YTD', gold: calcYtdReturn(goldYearData), silver: calcYtdReturn(silverYearData) },
      { period: '1Y Change', gold: calcReturn(goldYearData, Math.min(goldYearData.length - 1, 252)), silver: calcReturn(silverYearData, Math.min(silverYearData.length - 1, 252)) },
    ];
  }, [goldYearData, silverYearData]);

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

        {/* Welcome / How to use */}
        <section className="mb-6 rounded-lg border border-border bg-surface px-5 py-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Hey Guy, I made this dashboard for both of us to track gold and silver prices. Use the <strong>Gold</strong> and <strong>Silver</strong> buttons to switch between metals and see the technical analysis below. Hit <strong>Ratio</strong> for the gold/silver ratio. You can pick between candlestick, line, or area chart styles. The <strong>MA</strong> button toggles the 50-day and 200-day simple moving averages on the daily chart. You can scroll the chart all the way back to 2000.
          </p>
        </section>

        {/* Chart Controls */}
        <section className="mb-4">
          <ChartControls
            chartView={chartView}
            onChartViewChange={setChartView}
            chartType={chartType}
            onChartTypeChange={setChartType}
            showBMSB={showMAs}
            onBMSBChange={setShowMAs}
          />
        </section>

        {/* Main Chart */}
        <section className="mb-8">
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
              overlayLines={maOverlays}
              livePrice={livePrice}
              height={500}
            />
          )}
        </section>

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

        {/* Performance Comparison */}
        {performanceMetrics.length > 0 && (
          <section className="mb-8">
            <PerformanceTable
              metrics={performanceMetrics}
              goldHigh52w={goldYearData?.length ? Math.max(...goldYearData.map((d) => d.high)) : undefined}
              goldLow52w={goldYearData?.length ? Math.min(...goldYearData.map((d) => d.low)) : undefined}
              silverHigh52w={silverYearData?.length ? Math.max(...silverYearData.map((d) => d.high)) : undefined}
              silverLow52w={silverYearData?.length ? Math.min(...silverYearData.map((d) => d.low)) : undefined}
            />
          </section>
        )}

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
