'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import type { RSIData, MACDData, LineData } from '@/lib/types';
import { COLORS, RSI_OVERBOUGHT, RSI_OVERSOLD } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TADashboardProps {
  rsiData?: RSIData;
  macdData?: MACDData;
  momentumData?: LineData[];
  volatilityData?: LineData[];
  volatility30d?: number;
  className?: string;
}

function SignalBadge({ signal, color }: { signal: string; color: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        color === 'green' && 'bg-up/10 text-up',
        color === 'red' && 'bg-down/10 text-down',
        color === 'neutral' && 'bg-text-muted/10 text-text-muted'
      )}
    >
      {signal}
    </span>
  );
}

function MiniChart({ data, color, type = 'line' }: { data: { value: number }[]; color: string; type?: 'line' | 'bar' }) {
  if (!data.length) return null;

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <Bar
              dataKey="value"
              isAnimationActive={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const barColor = payload.value >= 0 ? COLORS.up : COLORS.down;
                return <rect x={x} y={y} width={width} height={Math.abs(height)} fill={barColor} opacity={0.6} />;
              }}
            />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function RSICard({ data }: { data: RSIData }) {
  const signal = data.isOverbought ? 'Overbought' : data.isOversold ? 'Oversold' : 'Neutral';
  const signalColor = data.isOverbought ? 'red' : data.isOversold ? 'green' : 'neutral';

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">RSI ({data.period})</h4>
        <SignalBadge signal={signal} color={signalColor} />
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-text-primary">
        {data.currentValue.toFixed(1)}
      </div>
      <div className="mt-1 text-[10px] text-text-muted">
        OB: {RSI_OVERBOUGHT} / OS: {RSI_OVERSOLD}
      </div>
      <MiniChart data={data.values} color={COLORS.gold.primary} />
    </div>
  );
}

function MACDCard({ data }: { data: MACDData }) {
  const signalColor = data.signal === 'bullish' ? 'green' : data.signal === 'bearish' ? 'red' : 'neutral';

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">MACD</h4>
        <SignalBadge signal={data.signal} color={signalColor} />
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-text-primary">
        {data.currentMACD.toFixed(4)}
      </div>
      <div className="mt-1 text-[10px] text-text-muted">
        Signal: {data.currentSignal.toFixed(4)}
      </div>
      <MiniChart data={data.histogram} color={COLORS.gold.primary} type="bar" />
    </div>
  );
}

function MomentumCard({ data }: { data: LineData[] }) {
  const current = data[data.length - 1]?.value ?? 0;
  const signal = current > 0 ? 'Positive' : current < 0 ? 'Negative' : 'Flat';
  const signalColor = current > 0 ? 'green' : current < 0 ? 'red' : 'neutral';

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Momentum</h4>
        <SignalBadge signal={signal} color={signalColor} />
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-text-primary">
        {current >= 0 ? '+' : ''}{current.toFixed(2)}%
      </div>
      <div className="mt-1 text-[10px] text-text-muted">Rate of Change (10)</div>
      <MiniChart data={data} color={COLORS.gold.primary} />
    </div>
  );
}

function VolatilityCard({ data, value }: { data: LineData[]; value: number }) {
  const signal = value > 30 ? 'High' : value > 15 ? 'Moderate' : 'Low';
  const signalColor = value > 30 ? 'red' : value > 15 ? 'neutral' : 'green';

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Volatility</h4>
        <SignalBadge signal={signal} color={signalColor} />
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-text-primary">
        {value.toFixed(1)}%
      </div>
      <div className="mt-1 text-[10px] text-text-muted">30-day annualized</div>
      <MiniChart data={data} color={COLORS.gold.primary} />
    </div>
  );
}

export function TADashboard({
  rsiData,
  macdData,
  momentumData,
  volatilityData,
  volatility30d,
  className,
}: TADashboardProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      {rsiData && <RSICard data={rsiData} />}
      {macdData && <MACDCard data={macdData} />}
      {momentumData && momentumData.length > 0 && <MomentumCard data={momentumData} />}
      {volatilityData && volatilityData.length > 0 && (
        <VolatilityCard data={volatilityData} value={volatility30d ?? 0} />
      )}
    </div>
  );
}
