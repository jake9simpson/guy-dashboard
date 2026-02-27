import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/finnhub';
import { isDemoMode, MOCK_GOLD_QUOTE, MOCK_SILVER_QUOTE } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Missing required parameter: symbol' }, { status: 400 });
  }

  if (isDemoMode()) {
    const quote = symbol.includes('XAG') ? MOCK_SILVER_QUOTE : MOCK_GOLD_QUOTE;
    return NextResponse.json(quote);
  }

  try {
    const data = await getQuote(symbol);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch quote';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
