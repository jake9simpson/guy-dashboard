'use client';

import { usePriceStore } from '@/stores/price-store';
import { formatCurrency, priceToGrams, priceToKg } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UnitConverterProps {
  className?: string;
}

export function UnitConverter({ className }: UnitConverterProps) {
  const gold = usePriceStore((s) => s.gold);
  const silver = usePriceStore((s) => s.silver);
  const currency = usePriceStore((s) => s.currency);

  const metals = [
    { name: 'Gold', price: gold?.price ?? 0 },
    { name: 'Silver', price: silver?.price ?? 0 },
  ];

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-5 shadow-sm',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
        Unit Converter
      </h3>
      <div className="space-y-4">
        {metals.map((metal) => (
          <div key={metal.name}>
            <p className="text-xs font-medium text-text-muted mb-2">{metal.name}</p>
            <div className="grid grid-cols-3 gap-3">
              <UnitCell
                label="Troy Oz"
                value={formatCurrency(metal.price, currency)}
              />
              <UnitCell
                label="Gram"
                value={formatCurrency(priceToGrams(metal.price), currency)}
              />
              <UnitCell
                label="Kilogram"
                value={formatCurrency(priceToKg(metal.price), currency)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-elevated px-3 py-2">
      <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
      <p className="font-mono text-sm font-semibold text-text-primary mt-0.5">{value}</p>
    </div>
  );
}
