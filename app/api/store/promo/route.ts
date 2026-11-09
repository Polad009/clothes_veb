import { NextRequest, NextResponse } from 'next/server';
import { findPromo } from '@/lib/db/site';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

/**
 * Looks up ONE promo code the shopper typed. The list of codes is never public.
 * Responds in the shape the checkout page reads: { promoCodes: [match] | [] }.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-client';
  if (!checkRateLimit(`promo_${ip}`, { limit: 15, windowMs: 60 * 1000 }).allowed) {
    return NextResponse.json({ error: 'Həddindən artıq cəhd. Bir dəqiqə sonra yenidən yoxlayın.', promoCodes: [] }, { status: 429 });
  }

  try {
    const code = new URL(req.url).searchParams.get('code') || '';
    const promo = await findPromo(code);
    const promoCodes = promo && promo.active !== false
      ? [{
          code: promo.code,
          type: promo.type,
          value: promo.value,
          minAmount: promo.minAmount,
          active: true,
          desc: promo.desc,
          uses: promo.uses,
          maxUses: promo.maxUses,
          expiresAt: promo.expiresAt,
        }]
      : [];

    return NextResponse.json({ promoCodes }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, promoCodes: [] }, { status: 500 });
  }
}
