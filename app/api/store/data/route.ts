import { NextResponse } from 'next/server';
import { listCatalog } from '@/lib/db/catalog';
import { getContent, getSettings } from '@/lib/db/site';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * Public storefront data. Orders and promo codes are never part of this
 * response: promo codes are checked one at a time via /api/store/promo.
 */
export async function GET() {
  try {
    const [products, content, settings] = await Promise.all([listCatalog(), getContent(), getSettings()]);

    return NextResponse.json(
      { version: 'v2026.11.09.db', products, content, settings },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('[StoreData] Failed to load store data:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
