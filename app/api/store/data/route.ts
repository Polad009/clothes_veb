import { NextResponse } from 'next/server';
import { readStoreDb } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = readStoreDb();

    // SECURE SANITIZATION: Never leak customer orders or pod orders to public requests!
    const sanitizedPromoCodes = (data.promoCodes || []).map((p: any) => ({
      code: p.code,
      type: p.type,
      value: p.value,
      minAmount: p.minAmount,
      active: p.active,
      desc: p.desc,
    }));

    return NextResponse.json({
      products: data.products || [],
      content: data.content || {},
      settings: data.settings || {},
      promoCodes: sanitizedPromoCodes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
