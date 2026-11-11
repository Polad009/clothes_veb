import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';
import { addStockAlert } from '@/lib/stockAlerts';

export const dynamic = 'force-dynamic';

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

/**
 * POST { productId, color, size, email, language }
 * Saves a "tell me when it's back" request for a sold-out colour/size.
 */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`stock_alert_${clientIp(req)}`, { limit: 8, windowMs: 10 * 60_000 }).allowed) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const result = await addStockAlert({
      productId: body.productId,
      color: body.color,
      size: body.size,
      email: body.email,
      language: body.language,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[StockAlert] save failed:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
