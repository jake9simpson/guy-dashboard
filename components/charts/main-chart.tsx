'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from 'lightweight-charts';
import type { CandlestickData, LineData, ChartType } from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface OverlayLine {
  data: LineData[];
  color: string;
  title: string;
}

interface MainChartProps {
  candlestickData?: CandlestickData[];
  lineData?: LineData[];
  chartType: ChartType;
  overlayLines?: OverlayLine[];
  height?: number;
  className?: string;
}

export function MainChart({
  candlestickData,
  lineData,
  chartType,
  overlayLines,
  height = 500,
  className,
}: MainChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const overlaySeriesRefs = useRef<ISeriesApi<SeriesType>[]>([]);

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

    // Remove existing overlay series
    for (const s of overlaySeriesRefs.current) {
      chart.removeSeries(s);
    }
    overlaySeriesRefs.current = [];

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

    // Add overlay lines
    if (overlayLines?.length) {
      for (const overlay of overlayLines) {
        const series = chart.addSeries(LineSeries, {
          color: overlay.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          crosshairMarkerRadius: 2,
          crosshairMarkerBackgroundColor: overlay.color,
          title: overlay.title,
        });
        series.setData(overlay.data);
        overlaySeriesRefs.current.push(series);
      }
    }

    // Default view: last ~1 year with a bit of right padding, scrollable to full history
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const pad = new Date(now.getTime() + 7 * 86400000); // 1 week right padding
    chart.timeScale().setVisibleRange({
      from: oneYearAgo.toISOString().split('T')[0],
      to: pad.toISOString().split('T')[0],
    });
  }, [chartType, candlestickData, lineData, overlayLines]);

  return (
    <div className={cn('w-full rounded-lg overflow-hidden border border-border bg-surface', className)}>
      <div ref={containerRef} style={{ height }} />
    </div>
  );
}
