'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart3, TrendingUp, Waves, ChevronDown } from 'lucide-react';
import { TIMEFRAMES, SMA_PERIODS, EMA_PERIODS } from '@/lib/constants';
import type { ChartType, ChartView, Timeframe } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TAOverlayOption {
  id: string;
  label: string;
  type: 'sma' | 'ema' | 'bollinger';
  period?: number;
}

const TA_OPTIONS: TAOverlayOption[] = [
  ...SMA_PERIODS.map((p) => ({ id: `sma-${p}`, label: `SMA ${p}`, type: 'sma' as const, period: p })),
  ...EMA_PERIODS.map((p) => ({ id: `ema-${p}`, label: `EMA ${p}`, type: 'ema' as const, period: p })),
  { id: 'bollinger', label: 'Bollinger Bands', type: 'bollinger' as const },
];

interface ChartControlsProps {
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  activeOverlays: string[];
  onOverlaysChange: (overlays: string[]) => void;
  className?: string;
}

const CHART_TYPE_ICONS: Record<ChartType, typeof BarChart3> = {
  candlestick: BarChart3,
  line: TrendingUp,
  area: Waves,
};

const CHART_VIEWS: { value: ChartView; label: string }[] = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'ratio', label: 'Ratio' },
  { value: 'overlay', label: 'Overlay' },
];

export function ChartControls({
  timeframe,
  onTimeframeChange,
  chartView,
  onChartViewChange,
  chartType,
  onChartTypeChange,
  activeOverlays,
  onOverlaysChange,
  className,
}: ChartControlsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOverlay(id: string) {
    if (activeOverlays.includes(id)) {
      onOverlaysChange(activeOverlays.filter((o) => o !== id));
    } else {
      onOverlaysChange([...activeOverlays, id]);
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Timeframe pills */}
      <div className="flex items-center gap-1 rounded-lg bg-surface-elevated p-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onTimeframeChange(tf)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              timeframe.value === tf.value
                ? 'bg-gold-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Metal selector */}
      <div className="flex items-center gap-1 rounded-lg bg-surface-elevated p-1">
        {CHART_VIEWS.map((view) => (
          <button
            key={view.value}
            onClick={() => onChartViewChange(view.value)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              chartView === view.value
                ? 'bg-gold-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Chart type toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-surface-elevated p-1">
        {(Object.keys(CHART_TYPE_ICONS) as ChartType[]).map((type) => {
          const Icon = CHART_TYPE_ICONS[type];
          return (
            <button
              key={type}
              onClick={() => onChartTypeChange(type)}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                chartType === type
                  ? 'bg-gold-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* TA Overlay multi-select dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            'bg-surface-elevated text-text-secondary hover:text-text-primary',
            activeOverlays.length > 0 && 'ring-1 ring-gold-primary text-gold-primary'
          )}
        >
          Indicators
          {activeOverlays.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-primary text-[10px] text-white">
              {activeOverlays.length}
            </span>
          )}
          <ChevronDown className={cn('h-3 w-3 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface p-1.5 shadow-lg">
            {TA_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-surface-elevated"
              >
                <input
                  type="checkbox"
                  checked={activeOverlays.includes(option.id)}
                  onChange={() => toggleOverlay(option.id)}
                  className="h-3.5 w-3.5 rounded border-border text-gold-primary accent-gold-primary"
                />
                <span className="text-text-primary">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
