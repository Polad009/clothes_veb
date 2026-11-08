import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb } from '@/lib/storeDb';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = readStoreDb();

    if (body.settings) {
      db.settings = { ...db.settings, ...body.settings };
    }

    if (body.content) {
      db.content = { ...db.content, ...body.content };
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, settings: db.settings, content: db.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
