import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, PodOrder } from '@/lib/storeDb';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function sanitizeStr(val: any, maxLen = 100): string {
  if (!val || typeof val !== 'string') return '';
  return val.replace(/[<>]/g, '').trim().slice(0, maxLen);
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }

  try {
    const db = readStoreDb();
    return NextResponse.json(db.podOrders || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Etibarsız məlumat göndərildi.' }, { status: 400 });
    }

    const db = readStoreDb();

    const podId = 'POD-' + Math.floor(100 + Math.random() * 900);
    const newPod: PodOrder = {
      id: podId,
      orderId: sanitizeStr(body.orderId, 50) || ('VTX-CUSTOM-' + Date.now().toString(36).toUpperCase()),
      customerName: sanitizeStr(body.customerName, 100) || 'Müştəri',
      customerPhone: sanitizeStr(body.customerPhone, 30) || '',
      customerEmail: sanitizeStr(body.customerEmail, 100) || '',
      garmentType: sanitizeStr(body.garmentType, 100) || 'Heavyweight Oversized Tee',
      garmentColor: sanitizeStr(body.garmentColor, 50) || 'Onyx Black',
      size: sanitizeStr(body.size, 10) || 'L',
      price: Math.max(0, Number(body.price) || 55),
      frontDesign: body.frontDesign || body.customData?.frontDesign || {},
      backDesign: body.backDesign || body.customData?.backDesign || {},
      status: 'Pending Print',
      createdAt: new Date().toISOString(),
      originalImage: typeof (body.originalImage || body.customData?.originalImage || body.customData?.frontDesign?.originalImage || body.customData?.backDesign?.originalImage) === 'string'
        ? String(body.originalImage || body.customData?.originalImage || body.customData?.frontDesign?.originalImage || body.customData?.backDesign?.originalImage)
        : '',
      placement: sanitizeStr(body.placement || body.customData?.placement, 100) || 'Sinə (Mərkəz)',
      customerNote: sanitizeStr(body.customerNote || body.customData?.customerNote, 500) || '',
      placementData: body.placementData || body.customData?.placementData || null,
      previewImage: typeof (body.previewImage || body.customData?.previewImage) === 'string'
        ? String(body.previewImage || body.customData?.previewImage)
        : '',
      customData: body.customData || null,
    };

    if (!db.podOrders) db.podOrders = [];
    db.podOrders.unshift(newPod);

    writeStoreDb(db);
    return NextResponse.json({ success: true, podOrder: newPod });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin icazəsi tələb olunur' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const db = readStoreDb();

    const podIndex = (db.podOrders || []).findIndex(p => p.id === id);
    if (podIndex === -1) {
      return NextResponse.json({ error: 'Fərdi sifariş tapılmadı.' }, { status: 404 });
    }

    if (status) {
      db.podOrders[podIndex].status = sanitizeStr(status, 50) as any;
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, podOrder: db.podOrders[podIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
