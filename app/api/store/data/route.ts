import { NextResponse } from 'next/server';
import { readStoreDb } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = readStoreDb();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
