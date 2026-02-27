import { NextRequest, NextResponse } from 'next/server';
import { getTimeSeries } from '@/lib/api/twelve-data';
import {
  isDemoMode,
  generateMockGoldData,
  generateMockSilverData,
} from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') ?? '1day';
  const outputsize = searchParams.get('outputsize') ?? '100';

  if (!symbol) {
    return NextResponse.json({ error: 'Missing required parameter: symbol' }, { status: 400 });
  }

  if (isDemoMode()) {
    const days = parseInt(outputsize, 10);
    const data = symbol.includes('XAG')
      ? generateMockSilverData(days)
      : generateMockGoldData(days);

    // Return in Twelve Data format so the client parser works
    const values = data.map((d) => ({
      datetime: new Date(d.time * 1000).toISOString().replace('T', ' ').slice(0, 19),
      open: d.open.toString(),
      high: d.high.toString(),
      low: d.low.toString(),
      close: d.close.toString(),
      volume: d.volume.toString(),
    }));

    return NextResponse.json({
      meta: { symbol, interval, currency_base: symbol.split('/')[0], currency_quote: 'USD', type: 'Physical Currency' },
      values,
      status: 'ok',
    });
  }

  try {
    const data = await getTimeSeries(symbol, interval, parseInt(outputsize, 10));
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    // Silver (XAG/USD) requires a paid Twelve Data plan — fall back to mock
    if (symbol.includes('XAG')) {
      const days = parseInt(outputsize, 10);
      const data = generateMockSilverData(days);
      const values = data.map((d) => ({
        datetime: new Date(d.time * 1000).toISOString().replace('T', ' ').slice(0, 19),
        open: d.open.toString(),
        high: d.high.toString(),
        low: d.low.toString(),
        close: d.close.toString(),
        volume: d.volume.toString(),
      }));
      return NextResponse.json({
        meta: { symbol, interval, currency_base: 'XAG', currency_quote: 'USD', type: 'Physical Currency' },
        values,
        status: 'ok',
      });
    }
    const message = err instanceof Error ? err.message : 'Failed to fetch historical data';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
