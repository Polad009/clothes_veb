import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreOrder } from '@/lib/storeDb';
import { notifyNewOrder } from '@/lib/notifications/orderNotifier';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Never expose full customer orders publicly
  if (isAdminAuthenticated(req)) {
    const db = readStoreDb();
    return NextResponse.json(db.orders);
  }
  return NextResponse.json(
    { error: 'Access denied: Sifariş məlumatları yalnız izləmə kodu və ya admin girişi ilə mümkündür.' },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, paymentMethod, subtotal, shipping, discount, total } = body;

    if (!customer || !items || !items.length) {
      return NextResponse.json({ error: 'Müştəri məlumatları və səbət tələb olunur.' }, { status: 400 });
    }

    const db = readStoreDb();
    const orderId = body.id || ('VTX-ORD-' + Math.floor(1000 + Math.random() * 9000));
    const trackingCode = body.trackingCode || (`AZ-EXP-${orderId.replace(/[^0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`);

    // Duplicate order prevention: if exact same order was submitted within last 20 seconds
    const custPhoneClean = (customer?.phone || '').replace(/\D/g, '');
    const recentDuplicate = (db.orders || []).find((o: any) => {
      if (o.id === orderId) return true;
      const orderPhoneClean = (o.customer?.phone || '').replace(/\D/g, '');
      const isSamePhone = custPhoneClean.length >= 7 && custPhoneClean === orderPhoneClean;
      const orderTime = new Date(o.date).getTime();
      const isRecent = !isNaN(orderTime) && (Date.now() - orderTime) < 20000;
      const isSameTotal = Math.abs((Number(o.total) || 0) - (Number(total) || 0)) < 0.01;
      return isSamePhone && isRecent && isSameTotal;
    });

    if (recentDuplicate) {
      return NextResponse.json({ success: true, order: recentDuplicate, duplicatePrevented: true });
    }

    const sanitizedCustomer = {
      fullName: String(customer.fullName || '').replace(/[<>]/g, '').trim().slice(0, 100),
      phone: String(customer.phone || '').replace(/[<>]/g, '').trim().slice(0, 30),
      email: String(customer.email || '').replace(/[<>]/g, '').trim().slice(0, 120),
      address: String(customer.address || '').replace(/[<>]/g, '').trim().slice(0, 250),
      city: String(customer.city || 'Bakı').replace(/[<>]/g, '').trim().slice(0, 60),
      country: 'Azərbaycan',
    };

    const newOrder: StoreOrder = {
      id: orderId,
      trackingCode: trackingCode,
      date: body.date || new Date().toISOString(),
      customer: sanitizedCustomer,
      items,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: body.paymentStatus || 'Paid',
      orderStatus: body.orderStatus || 'Yeni Sifariş',
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
    };

    // Remove if already exists with this ID (for idempotent sync)
    db.orders = (db.orders || []).filter(o => o.id !== orderId);
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
          placement: item.customData.placement || 'Sinə (Mərkəz)',
          customerNote: item.customData.customerNote || '',
          originalImage: item.customData.uploadedImage || item.customData.originalImage || '',
          previewImage: item.customData.previewImage || '',
          customData: item.customData,
          frontDesign: item.customData.frontDesign || {},
          backDesign: item.customData.backDesign || {},
          status: 'Pending Print',
          createdAt: new Date().toISOString(),
        });
      }
    }

    writeStoreDb(db);

    // Send instant free mobile notification (Telegram / NTFY)
    try {
      await notifyNewOrder(newOrder);
    } catch (e) {
      console.warn('Notification failed:', e);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll');

    const db = readStoreDb();

    if (clearAll === 'true') {
      db.orders = [];
      db.podOrders = [];
      writeStoreDb(db);
      return NextResponse.json({ success: true, message: 'Bütün sifarişlər təmizləndi.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Sifariş ID-si tələb olunur.' }, { status: 400 });
    }

    db.orders = db.orders.filter((o) => o.id !== id);
    db.podOrders = (db.podOrders || []).filter((p) => p.orderId !== id && p.id !== id);

    writeStoreDb(db);
    return NextResponse.json({ success: true, message: 'Sifariş silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
