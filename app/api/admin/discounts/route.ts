import { NextRequest, NextResponse } from 'next/server';
import { isAdminOwner } from '@/lib/adminAuth';
import { deleteCampaign, listCampaigns, saveCampaign } from '@/lib/db/campaigns';
import { refreshStore } from '@/lib/storeSnapshot';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!isAdminOwner(req)) return unauthorized();
  return NextResponse.json({ campaigns: await listCampaigns() }, { headers: { 'Cache-Control': 'no-store' } });
}

/** POST — create or update one discount. */
export async function POST(req: NextRequest) {
  if (!isAdminOwner(req)) return unauthorized();
  try {
    const campaign = await saveCampaign(await req.json());
    refreshStore();
    return NextResponse.json({ success: true, campaign });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

/** DELETE ?id=… */
export async function DELETE(req: NextRequest) {
  if (!isAdminOwner(req)) return unauthorized();
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id tələb olunur' }, { status: 400 });
  await deleteCampaign(id);
  refreshStore();
  return NextResponse.json({ success: true });
}
