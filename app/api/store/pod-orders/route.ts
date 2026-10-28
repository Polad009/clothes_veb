import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, PodOrder } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    const db = readStoreDb();

    const podId = 'POD-' + Math.floor(100 + Math.random() * 900);
    const newPod: PodOrder = {
      id: podId,
      orderId: body.orderId || ('VTX-CUSTOM-' + Date.now().toString(36).toUpperCase()),
      customerName: body.customerName || 'Müştəri',
      customerPhone: body.customerPhone || '',
      customerEmail: body.customerEmail || '',
      garmentType: body.garmentType || 'Heavyweight Oversized Tee',
      garmentColor: body.garmentColor || 'Onyx Black',
      size: body.size || 'L',
      price: body.price || 55,
      frontDesign: body.frontDesign || body.customData?.frontDesign || {},
      backDesign: body.backDesign || body.customData?.backDesign || {},
      status: 'Pending Print',
      createdAt: new Date().toISOString(),
      originalImage: body.originalImage || body.customData?.originalImage || body.customData?.frontDesign?.originalImage || body.customData?.backDesign?.originalImage || '',
      placement: body.placement || body.customData?.placement || 'Sinə (Mərkəz)',
      customerNote: body.customerNote || body.customData?.customerNote || '',
      placementData: body.placementData || body.customData?.placementData || null,
      previewImage: body.previewImage || body.customData?.previewImage || '',
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
  try {
    const { id, status } = await req.json();
    const db = readStoreDb();

    const podIndex = (db.podOrders || []).findIndex(p => p.id === id);
    if (podIndex === -1) {
      return NextResponse.json({ error: 'Fərdi sifariş tapılmadı.' }, { status: 404 });
    }

    if (status) {
      db.podOrders[podIndex].status = status;
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, podOrder: db.podOrders[podIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
