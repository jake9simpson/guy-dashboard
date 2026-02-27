'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from 'lightweight-charts';
import type {
  CandlestickData,
  LineData,
  ChartType,
  SMAData,
  EMAData,
  BollingerBandsData,
} from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface OverlayConfig {
  type: 'sma' | 'ema' | 'bollinger';
  data: SMAData | EMAData | BollingerBandsData;
}

interface MainChartProps {
  candlestickData?: CandlestickData[];
  lineData?: LineData[];
  chartType: ChartType;
  overlays?: OverlayConfig[];
  height?: number;
  className?: string;
}

const SMA_COLORS: Record<number, string> = {
  20: '#2563EB',
  50: '#D97706',
  100: '#7C3AED',
  200: '#DC2626',
};

const EMA_COLORS: Record<number, string> = {
  12: '#0891B2',
  26: '#BE185D',
};

export function MainChart({
  candlestickData,
  lineData,
  chartType,
  overlays = [],
  height = 500,
  className,
}: MainChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const overlaySeriesRef = useRef<ISeriesApi<SeriesType>[]>([]);

  const clearOverlays = useCallback(() => {
    if (!chartRef.current) return;
    for (const series of overlaySeriesRef.current) {
      chartRef.current.removeSeries(series);
    }
    overlaySeriesRef.current = [];
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: COLORS.background },
        textColor: COLORS.text.secondary,
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: COLORS.border, style: 1 },
        horzLines: { color: COLORS.border, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: COLORS.gold.primary,
          width: 1,
          style: 2,
          labelBackgroundColor: COLORS.gold.primary,
        },
        horzLine: {
          color: COLORS.gold.primary,
          width: 1,
          style: 2,
          labelBackgroundColor: COLORS.gold.primary,
        },
      },
      rightPriceScale: {
        borderColor: COLORS.border,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
      width: containerRef.current.clientWidth,
      height,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      overlaySeriesRef.current = [];
    };
  }, [height]);

  // Update main series when chart type or data changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove existing main series
    if (mainSeriesRef.current) {
      chart.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }

    if (chartType === 'candlestick' && candlestickData?.length) {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: COLORS.up,
        downColor: COLORS.down,
        borderUpColor: COLORS.up,
        borderDownColor: COLORS.down,
        wickUpColor: COLORS.up,
        wickDownColor: COLORS.down,
      });
      series.setData(candlestickData);
      mainSeriesRef.current = series;
    } else if (chartType === 'line' && lineData?.length) {
      const series = chart.addSeries(LineSeries, {
        color: COLORS.gold.primary,
        lineWidth: 2,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: COLORS.gold.primary,
      });
      series.setData(lineData);
      mainSeriesRef.current = series;
    } else if (chartType === 'area' && lineData?.length) {
      const series = chart.addSeries(AreaSeries, {
        lineColor: COLORS.gold.primary,
        topColor: 'rgba(184, 134, 11, 0.4)',
        bottomColor: 'rgba(184, 134, 11, 0.04)',
        lineWidth: 2,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: COLORS.gold.primary,
      });
      series.setData(lineData);
      mainSeriesRef.current = series;
    }

    chart.timeScale().fitContent();
  }, [chartType, candlestickData, lineData]);

  // Update overlays
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    clearOverlays();

    for (const overlay of overlays) {
      if (overlay.type === 'sma' || overlay.type === 'ema') {
        const data = overlay.data as SMAData | EMAData;
        const colorMap = overlay.type === 'sma' ? SMA_COLORS : EMA_COLORS;
        const color = colorMap[data.period] ?? '#6366F1';
        const series = chart.addSeries(LineSeries, {
          color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        series.setData(data.values);
        overlaySeriesRef.current.push(series);
      } else if (overlay.type === 'bollinger') {
        const data = overlay.data as BollingerBandsData;
        const upperSeries = chart.addSeries(LineSeries, {
          color: 'rgba(99, 102, 241, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        upperSeries.setData(data.upper);
        overlaySeriesRef.current.push(upperSeries);

        const middleSeries = chart.addSeries(LineSeries, {
          color: 'rgba(99, 102, 241, 0.8)',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        middleSeries.setData(data.middle);
        overlaySeriesRef.current.push(middleSeries);

        const lowerSeries = chart.addSeries(LineSeries, {
          color: 'rgba(99, 102, 241, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        lowerSeries.setData(data.lower);
        overlaySeriesRef.current.push(lowerSeries);
      }
    }
  }, [overlays, clearOverlays]);

  return (
    <div className={cn('w-full rounded-lg overflow-hidden border border-border bg-surface', className)}>
      <div ref={containerRef} style={{ height }} />
    </div>
  );
}
