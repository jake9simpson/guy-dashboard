'use client';

import { cn } from '@/lib/utils';

interface PriceChangeProps {
  value: number;
  percentChange: number;
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  className?: string;
}

export function PriceChange({
  value,
  percentChange,
  size = 'md',
  showArrow = true,
  className,
}: PriceChangeProps) {
  const isPositive = value >= 0;
  const color = isPositive ? 'text-up' : 'text-down';
  const arrow = isPositive ? '\u25B2' : '\u25BC';
  const sign = isPositive ? '+' : '';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 font-mono font-medium', color, sizeClasses[size], className)}>
      {showArrow && <span className="text-[0.7em]">{arrow}</span>}
      <span>
        {sign}${Math.abs(value).toFixed(2)}
      </span>
      <span className="opacity-80">
        ({sign}{percentChange.toFixed(2)}%)
      </span>
    </span>
  );
}
