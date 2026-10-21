import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
