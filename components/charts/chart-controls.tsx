'use client';

import { BarChart3, TrendingUp, Waves } from 'lucide-react';
import type { ChartType, ChartView } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChartControlsProps {
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  showBMSB?: boolean;
  onBMSBChange?: (show: boolean) => void;
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
];

export function ChartControls({
  chartView,
  onChartViewChange,
  chartType,
  onChartTypeChange,
  showBMSB,
  onBMSBChange,
  className,
}: ChartControlsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
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

      {/* Moving averages toggle — only for gold/silver views */}
      {chartView !== 'ratio' && onBMSBChange && (
        <button
          onClick={() => onBMSBChange(!showBMSB)}
          title="50-day and 200-day SMA"
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            showBMSB
              ? 'bg-gold-primary text-white shadow-sm'
              : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface'
          )}
        >
          MA
        </button>
      )}
    </div>
  );
}
