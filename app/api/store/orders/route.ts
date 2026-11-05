import { NextRequest, NextResponse } from 'next/server';
import { readStoreDb, writeStoreDb, StoreOrder } from '@/lib/storeDb';
import { notifyNewOrder } from '@/lib/notifications/orderNotifier';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '@/lib/email/emailService';
import { getActivePaymentProvider, PaymentMethod, PaymentRequest } from '@/lib/payments';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

async function syncOrderToSupabase(order: StoreOrder, customer: any, items: any[], userId?: string) {
  const client = supabaseServer;
  if (!client) return;
  try {
    // Attempt insert with modern payment schema columns
    const fullPayload: any = {
      user_id: userId || null,
      customer_name: customer.fullName,
      customer_phone: customer.phone,
      customer_email: customer.email,
      delivery_address: customer.address,
      delivery_city: customer.city,
      total_amount: Number(order.total) || 0,
      payment_method: order.paymentMethod || 'Card',
      payment_status: order.paymentStatus || 'pending_payment',
      order_status: order.orderStatus || 'Yeni Sifariş',
      is_test: Boolean(order.isTest),
      currency: order.currency || 'AZN',
      promo_code: order.promoCode || null,
      provider: order.provider || 'mock',
      provider_payment_id: order.providerPaymentId || null,
    };

    let supaOrder: any = null;
    const { data, error } = await client
      .from('orders')
      .insert(fullPayload)
      .select()
      .single();

    if (error) {
      // Fallback if migration hasn't added new columns to Supabase yet
      if (error.code === 'PGRST204' || error.message?.includes('column')) {
        console.warn('Supabase missing new payment columns, falling back to base schema:', error.message);
        const fallbackPayload = {
          user_id: userId || null,
          customer_name: customer.fullName,
          customer_phone: customer.phone,
          customer_email: customer.email,
          delivery_address: customer.address,
          delivery_city: customer.city,
          total_amount: Number(order.total) || 0,
          payment_method: order.paymentMethod || 'Card',
          payment_status: order.paymentStatus || (order.isTest ? 'test_paid' : 'paid'),
          order_status: order.orderStatus || 'Yeni Sifariş',
        };
        const resFallback = await client.from('orders').insert(fallbackPayload).select().single();
        supaOrder = resFallback.data;
      } else {
        console.warn('Supabase insert warning:', error);
      }
    } else {
      supaOrder = data;
    }

    if (supaOrder && items && Array.isArray(items)) {
      const itemRows = items.map((i: any) => ({
        order_id: supaOrder.id,
        item_name: String(i.name || 'Məhsul'),
        color: String(i.color || 'Standart'),
        size: String(i.size || 'L'),
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.price) || 0,
        total_price: (Number(i.price) || 0) * (Number(i.quantity) || 1),
      }));
      await client.from('order_items').insert(itemRows);
    }
  } catch (err) {
    console.warn('Supabase cloud order sync warning:', err);
  }
}

export async function GET(req: NextRequest) {
  if (isAdminAuthenticated(req)) {
    const db = readStoreDb();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'test' | 'real' | 'all'

    let orders = db.orders || [];
    if (filter === 'test') {
      orders = orders.filter((o) => o.isTest === true || o.paymentStatus === 'test_paid');
    } else if (filter === 'real') {
      orders = orders.filter((o) => o.isTest !== true && o.paymentStatus !== 'test_paid');
    }
    return NextResponse.json(orders);
  }
  return NextResponse.json(
    { error: 'Access denied: Sifariş məlumatları yalnız izləmə kodu və ya admin girişi ilə mümkündür.' },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  try {
    // 0. Security Layer: Rate Limiting & Anti-Flood Protection
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-client';
    const rateCheck = checkRateLimit(`checkout_${clientIp}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Həddindən artıq cəhd qeydə alındı. Zəhmət olmasa bir dəqiqə sonra təkrar yoxlayın.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customer, items, paymentMethod: rawMethod, promoCode, currency: requestedCurrency, turnstileToken } = body;

    // 0.1 Cloudflare Turnstile Bot Defense Verification
    if (turnstileToken) {
      const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!turnstileResult.success) {
        return NextResponse.json({ error: turnstileResult.error || 'Təhlükəsizlik yoxlanışından keçilmədi.' }, { status: 403 });
      }
    }

    if (!customer || !items || !items.length) {
      return NextResponse.json({ error: 'Müştəri məlumatları və səbət tələb olunur.' }, { status: 400 });
    }

    const db = readStoreDb();
    const isTestMode = (process.env.PAYMENT_MODE || 'test').toLowerCase() === 'test';

    // 1. Server-side Recalculation: Verify prices & subtotal against database
    let serverSubtotal = 0;
    const validatedItems: any[] = [];

    for (const clientItem of items) {
      const matchingProduct = (db.products || []).find((p) => p.id === clientItem.productId);
      const unitPrice = clientItem.isCustom
        ? (Number(clientItem.price) || 0)
        : (matchingProduct ? Number(matchingProduct.price) : (Number(clientItem.price) || 0));

      const qty = Math.max(1, Math.floor(Number(clientItem.quantity) || 1));
      serverSubtotal += unitPrice * qty;

      validatedItems.push({
        ...clientItem,
        price: unitPrice,
        quantity: qty,
      });
    }

    // 2. Server-side Shipping Calculation
    const city = String(customer.city || 'Bakı').trim();
    const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city);
    const serverShipping = isFreeZone ? 0 : (serverSubtotal >= 60 ? 0 : 5);

    // 3. Server-side Promo Code Validation
    let serverDiscount = 0;
    let validatedPromoCode: string | null = null;
    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promoObj = (db.promoCodes || []).find(
        (p) => (p.code || '').trim().toUpperCase() === cleanCode && p.active !== false
      );
      if (promoObj) {
        const minAmt = Number(promoObj.minAmount) || 0;
        if (serverSubtotal >= minAmt) {
          validatedPromoCode = promoObj.code;
          if (promoObj.type === 'fixed') {
            serverDiscount = Math.min(serverSubtotal, Number(promoObj.value) || 0);
          } else {
            const pct = Math.min(100, Math.max(0, Number(promoObj.value) || 0));
            serverDiscount = (serverSubtotal * pct) / 100;
          }
        }
      }
    }

    const serverTotal = Math.max(0, Math.round((serverSubtotal - serverDiscount + serverShipping) * 100) / 100);

    // 4. Normalize Payment Method
    let method: PaymentMethod = 'card';
    const methodStr = String(rawMethod || '').toLowerCase();
    if (methodStr.includes('apple')) {
      method = 'apple_pay';
    } else if (methodStr.includes('google')) {
      method = 'google_pay';
    } else if (methodStr.includes('cod') || methodStr.includes('delivery') || methodStr.includes('çatdırılma') || methodStr.includes('nağd')) {
      method = 'cash_on_delivery';
    }

    // Check COD eligibility (Custom POD items require upfront digital payment)
    const hasCustomItems = validatedItems.some((i) => i.isCustom);
    if (method === 'cash_on_delivery' && hasCustomItems) {
      return NextResponse.json(
        { error: 'Fərdi dizaynlı məhsullar üçün çatdırılmada ödəniş keçərli deyil. Zəhmət olmasa kart və ya Apple/Google Pay seçin.' },
        { status: 400 }
      );
    }

    const orderId = body.id || ('VTX-ORD-' + Math.floor(1000 + Math.random() * 9000));
    const trackingCode = body.trackingCode || (`AZ-EXP-${orderId.replace(/[^0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`);

    // 5. Duplicate Order Guard (Idempotency)
    const custPhoneClean = (customer?.phone || '').replace(/\D/g, '');
    const recentDuplicate = (db.orders || []).find((o: any) => {
      if (o.id === orderId) return true;
      const orderPhoneClean = (o.customer?.phone || '').replace(/\D/g, '');
      const isSamePhone = custPhoneClean.length >= 7 && custPhoneClean === orderPhoneClean;
      const orderTime = new Date(o.date).getTime();
      const isRecent = !isNaN(orderTime) && (Date.now() - orderTime) < 20000;
      const isSameTotal = Math.abs((Number(o.total) || 0) - serverTotal) < 0.01;
      return isSamePhone && isRecent && isSameTotal;
    });

    if (recentDuplicate) {
      return NextResponse.json({ success: true, order: recentDuplicate, duplicatePrevented: true });
    }

    // 6. Execute Pluggable Payment Provider
    const provider = getActivePaymentProvider();
    const paymentRequest: PaymentRequest = {
      orderId,
      amount: serverTotal,
      currency: requestedCurrency || 'AZN',
      method,
      items: validatedItems.map((i) => ({
        id: i.productId || i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        type: i.isCustom ? 'custom' : 'ready',
        size: i.size,
        color: i.color,
      })),
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        country: 'Azərbaycan',
      },
      isTest: isTestMode,
      promoCode: validatedPromoCode,
      shippingCost: serverShipping,
      discountAmount: serverDiscount,
    };

    const paymentResponse = await provider.createPayment(paymentRequest);

    if (!paymentResponse.success) {
      return NextResponse.json(
        { error: paymentResponse.message || 'Ödəniş təsdiqlənmədi.' },
        { status: 400 }
      );
    }

    // 7. Stock Management: If real order, decrement stock; if test order, preserve stock
    if (!isTestMode) {
      for (const item of validatedItems) {
        if (!item.isCustom && item.productId) {
          const prodIndex = (db.products || []).findIndex((p) => p.id === item.productId);
          if (prodIndex !== -1) {
            // If product has explicit quantity or inventory flag
            if (typeof (db.products[prodIndex] as any).stockCount === 'number') {
              (db.products[prodIndex] as any).stockCount = Math.max(0, (db.products[prodIndex] as any).stockCount - item.quantity);
            }
          }
        }
      }
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
      userId: body.userId || undefined,
      date: body.date || new Date().toISOString(),
      customer: sanitizedCustomer,
      items: validatedItems,
      paymentMethod:
        method === 'apple_pay'
          ? 'Apple Pay'
          : method === 'google_pay'
          ? 'Google Pay'
          : method === 'cash_on_delivery'
          ? 'Çatdırılmada Ödəniş (COD)'
          : 'Bank Kartı (Visa/Mastercard)',
      paymentStatus: paymentResponse.status,
      orderStatus: method === 'cash_on_delivery' ? 'Təsdiqləndi (COD)' : 'Yeni Sifariş',
      subtotal: serverSubtotal,
      shipping: serverShipping,
      discount: serverDiscount,
      total: serverTotal,
      isTest: isTestMode,
      provider: provider.name,
      providerPaymentId: paymentResponse.transactionId,
      promoCode: validatedPromoCode || undefined,
      currency: requestedCurrency || 'AZN',
    };

    // Remove if already exists with this ID (for idempotent sync)
    db.orders = (db.orders || []).filter((o) => o.id !== orderId);
    db.orders.unshift(newOrder);

    // If any items are custom print on demand items, automatically record them in podOrders as well
    for (const item of validatedItems) {
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

    // Persist into Supabase Cloud Database in background
    syncOrderToSupabase(newOrder, sanitizedCustomer, validatedItems, body.userId);

    // Send instant mobile notification (Telegram / NTFY)
    try {
      await notifyNewOrder(newOrder);
    } catch (e) {
      console.warn('Notification failed:', e);
    }

    // Send customer order confirmation email asynchronously
    sendOrderConfirmation(newOrder).catch((e) => {
      console.warn('Order confirmation email warning:', e);
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      paymentResponse,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Server xətası' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, orderStatus, paymentStatus } = await req.json();
    const db = readStoreDb();
    const orderIndex = db.orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Sifariş tapılmadı.' }, { status: 404 });
    }

    if (orderStatus) {
      db.orders[orderIndex].orderStatus = orderStatus;
      sendOrderStatusUpdate(db.orders[orderIndex], orderStatus).catch((e) => {
        console.warn('Status update email warning:', e);
      });
    }
    if (paymentStatus) {
      db.orders[orderIndex].paymentStatus = paymentStatus;
    }

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
    const clearTest = searchParams.get('clearTest');

    const db = readStoreDb();

    if (clearTest === 'true') {
      const initialCount = db.orders.length;
      const testIds = new Set(
        db.orders
          .filter((o) => o.isTest === true || o.paymentStatus === 'test_paid')
          .map((o) => o.id)
      );
      db.orders = db.orders.filter((o) => !testIds.has(o.id));
      db.podOrders = (db.podOrders || []).filter((p) => !testIds.has(p.orderId));
      writeStoreDb(db);
      return NextResponse.json({
        success: true,
        message: `${initialCount - db.orders.length} test sifarişi silindi.`,
      });
    }

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
