import { NextRequest, NextResponse } from 'next/server';
import { getBatchQuotes, getQuote } from '@/lib/api/alpaca';
import { MINING_STOCKS } from '@/lib/constants';
import { isStocksDemoMode, MOCK_MINING_STOCKS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbolsParam = searchParams.get('symbols');

  const symbols = symbolsParam
    ? symbolsParam.split(',').map((s) => s.trim())
    : MINING_STOCKS.map((s) => s.symbol);

  if (isStocksDemoMode()) {
    const filtered = MOCK_MINING_STOCKS.filter((s) => symbols.includes(s.symbol));
    return NextResponse.json(filtered);
  }

  try {
    let quotes;
    if (symbols.length === 1) {
      quotes = [await getQuote(symbols[0])];
    } else {
      quotes = await getBatchQuotes(symbols);
    }

    return NextResponse.json(quotes, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch stock quotes';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
