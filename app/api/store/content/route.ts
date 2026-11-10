import { NextRequest, NextResponse } from 'next/server';
import { getContent, getSettings, saveContent, saveSettings } from '@/lib/db/site';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { refreshStore } from '@/lib/storeSnapshot';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = body.settings ? await saveSettings(body.settings) : await getSettings();
    const content = body.content ? await saveContent(body.content) : await getContent();
    refreshStore();
    return NextResponse.json({ success: true, settings, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
