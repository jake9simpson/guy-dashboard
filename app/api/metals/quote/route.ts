import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/twelve-data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Missing required parameter: symbol' }, { status: 400 });
  }

  try {
    const data = await getQuote(symbol);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch quote';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
