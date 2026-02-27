'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ComposedChart,
  CartesianGrid,
} from 'recharts';
import type { LineData, RSIData, MACDData } from '@/lib/types';
import { COLORS, RSI_OVERBOUGHT, RSI_OVERSOLD } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VolumeDataPoint {
  time: string;
  volume: number;
}

interface TAIndicatorPanelProps {
  rsiData?: RSIData;
  macdData?: MACDData;
  volumeData?: VolumeDataPoint[];
  className?: string;
}

function PanelLabel({ label }: { label: string }) {
  return (
    <div className="absolute left-2 top-1 z-10 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
      {label}
    </div>
  );
}

function RSIPanel({ data }: { data: RSIData }) {
  return (
    <div className="relative h-[120px] border-t border-border">
      <PanelLabel label={`RSI (${data.period})`} />
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.values} margin={{ top: 16, right: 50, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="time" hide />
          <YAxis
            domain={[0, 100]}
            ticks={[RSI_OVERSOLD, 50, RSI_OVERBOUGHT]}
            width={30}
            tick={{ fontSize: 10, fill: COLORS.text.muted }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={RSI_OVERBOUGHT} stroke={COLORS.down} strokeDasharray="3 3" strokeOpacity={0.6} />
          <ReferenceLine y={RSI_OVERSOLD} stroke={COLORS.up} strokeDasharray="3 3" strokeOpacity={0.6} />
          <ReferenceLine y={50} stroke={COLORS.text.muted} strokeDasharray="3 3" strokeOpacity={0.3} />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(value: number | undefined) => [(value ?? 0).toFixed(2), 'RSI']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS.gold.primary}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MACDPanel({ data }: { data: MACDData }) {
  const combined = data.macdLine.map((point, i) => ({
    time: point.time,
    macd: point.value,
    signal: data.signalLine[i]?.value ?? 0,
    histogram: data.histogram[i]?.value ?? 0,
  }));

  return (
    <div className="relative h-[120px] border-t border-border">
      <PanelLabel label="MACD" />
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combined} margin={{ top: 16, right: 50, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="time" hide />
          <YAxis
            width={30}
            tick={{ fontSize: 10, fill: COLORS.text.muted }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke={COLORS.text.muted} strokeDasharray="3 3" strokeOpacity={0.3} />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(value: number | undefined, name: string | undefined) => [(value ?? 0).toFixed(4), (name ?? '').toUpperCase()]}
          />
          <Bar
            dataKey="histogram"
            fill={COLORS.gold.light}
            isAnimationActive={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              const color = payload.histogram >= 0 ? COLORS.up : COLORS.down;
              return <rect x={x} y={y} width={width} height={Math.abs(height)} fill={color} opacity={0.5} />;
            }}
          />
          <Line type="monotone" dataKey="macd" stroke="#2563EB" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="signal" stroke="#DC2626" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function VolumePanel({ data }: { data: VolumeDataPoint[] }) {
  return (
    <div className="relative h-[120px] border-t border-border">
      <PanelLabel label="Volume" />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 50, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="time" hide />
          <YAxis
            width={30}
            tick={{ fontSize: 10, fill: COLORS.text.muted }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => {
              if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
              if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
              return `${v}`;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), 'Volume']}
          />
          <Bar
            dataKey="volume"
            fill={COLORS.gold.light}
            opacity={0.6}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TAIndicatorPanel({
  rsiData,
  macdData,
  volumeData,
  className,
}: TAIndicatorPanelProps) {
  const hasData = rsiData || macdData || volumeData;
  if (!hasData) return null;

  return (
    <div className={cn('w-full rounded-lg border border-border bg-surface overflow-hidden', className)}>
      {rsiData && <RSIPanel data={rsiData} />}
      {macdData && <MACDPanel data={macdData} />}
      {volumeData && volumeData.length > 0 && <VolumePanel data={volumeData} />}
    </div>
  );
}
