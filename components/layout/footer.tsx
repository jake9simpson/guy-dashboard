'use client';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gold-gradient text-sm font-semibold">
            The Guy Report
          </p>
          <p className="text-xs text-text-muted text-center">
            Market data provided by Yahoo Finance and Alpaca. Prices may be delayed.
          </p>
        </div>
      </div>
    </footer>
  );
}
