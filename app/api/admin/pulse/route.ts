import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getPulse } from '@/lib/db/stats';

export const dynamic = 'force-dynamic';

/** GET — counts for the navigation badges and the newest order (polled by the admin panel). */
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await getPulse(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
