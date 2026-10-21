import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreOrder } from '@/lib/storeDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = readStoreDb();
    return NextResponse.json(db.orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, paymentMethod, subtotal, shipping, discount, total } = body;

    if (!customer || !items || !items.length) {
      return NextResponse.json({ error: 'Müştəri məlumatları və səbət tələb olunur.' }, { status: 400 });
    }

    const db = readStoreDb();
    const orderId = 'VTX-ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: StoreOrder = {
      id: orderId,
      date: new Date().toISOString(),
      customer,
      items,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
    };

    db.orders.unshift(newOrder);

    // If any items are custom print on demand items, automatically record them in podOrders as well!
    for (const item of items) {
      if (item.isCustom && item.customData) {
        const podId = 'POD-' + Math.floor(100 + Math.random() * 900);
        db.podOrders.unshift({
          id: podId,
          orderId: newOrder.id,
          customerName: customer.fullName,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          garmentType: item.customData.garmentType || item.name,
          garmentColor: item.color,
          size: item.size,
          price: item.price,
          frontDesign: item.customData.frontDesign || {},
          backDesign: item.customData.backDesign || {},
          status: 'Pending Print',
          createdAt: new Date().toISOString(),
        });
      }
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, orderStatus, paymentStatus } = await req.json();
    const db = readStoreDb();
    const orderIndex = db.orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Sifariş tapılmadı.' }, { status: 404 });
    }

    if (orderStatus) db.orders[orderIndex].orderStatus = orderStatus;
    if (paymentStatus) db.orders[orderIndex].paymentStatus = paymentStatus;

    writeStoreDb(db);
    return NextResponse.json({ success: true, order: db.orders[orderIndex] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
