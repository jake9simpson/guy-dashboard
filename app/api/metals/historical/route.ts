import { NextRequest, NextResponse } from 'next/server';
import { getTimeSeries } from '@/lib/api/twelve-data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') ?? '1day';
  const outputsize = searchParams.get('outputsize') ?? '100';

  if (!symbol) {
    return NextResponse.json({ error: 'Missing required parameter: symbol' }, { status: 400 });
  }

  try {
    const data = await getTimeSeries(symbol, interval, parseInt(outputsize, 10));
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch historical data';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
