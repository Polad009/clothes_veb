import { NextRequest, NextResponse } from 'next/server';
import type { StoreOrder } from '@/lib/db/types';
import {
  createOrder,
  createPodOrder,
  deleteAllOrders,
  deleteOrder,
  deleteTestOrders,
  findRecentDuplicate,
  listOrders,
  OutOfStockError,
  updateOrder,
} from '@/lib/db/orders';
import { resolveUnitPrice } from '@/lib/db/products';
import { listCatalog } from '@/lib/db/catalog';
import { checkPromo, getSettings, incrementPromoUses } from '@/lib/db/site';
import { customPrintPrice } from '@/lib/studio/catalog';
import { notifyNewOrder } from '@/lib/notifications/orderNotifier';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { sendNewOrderAlert, sendOrderConfirmation, sendOrderStatusUpdate } from '@/lib/email/emailService';
import { getActivePaymentProvider, PaymentMethod, PaymentRequest } from '@/lib/payments';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/rateLimiter';
import { validateShippingRate, isDomesticDestination } from '@/lib/shipping';
import { getCountryByCode } from '@/lib/countries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Access denied: Sifariş məlumatları yalnız izləmə kodu və ya admin girişi ilə mümkündür.' },
      { status: 403 }
    );
  }
  try {
    const filter = new URL(req.url).searchParams.get('filter') as 'test' | 'real' | 'all' | null;
    return NextResponse.json(await listOrders(filter));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

    if (!customer || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: 'Müştəri məlumatları və səbət tələb olunur.' }, { status: 400 });
    }

    const isTestMode = (process.env.PAYMENT_MODE || 'test').toLowerCase() === 'test';
    const orderCurrency: 'AZN' | 'USD' = requestedCurrency === 'USD' ? 'USD' : 'AZN';

    // 1. Server-side Recalculation: prices always come from the live catalogue
    const catalogue = await listCatalog();
    let serverSubtotal = 0;
    const validatedItems: any[] = [];

    for (const clientItem of items) {
      const qty = Math.min(99, Math.max(1, Math.floor(Number(clientItem.quantity) || 1)));
      let unitPrice: number;

      if (clientItem.isCustom) {
        const studioPrice = customPrintPrice(clientItem.productId, clientItem.customData);
        if (studioPrice === null) {
          return NextResponse.json(
            { error: 'Öz dizaynlı məhsul tanınmadı. Zəhmət olmasa dizaynı studiyada yenidən səbətə əlavə edin.' },
            { status: 409 }
          );
        }
        unitPrice = resolveUnitPrice({ price: studioPrice }, orderCurrency, clientItem.price);
      } else {
        const product = catalogue.find((p) => p.id === clientItem.productId || p.slug === clientItem.productId);
        if (!product) {
          const label = String(clientItem.name || 'Məhsul').replace(/[<>]/g, '').slice(0, 80);
          return NextResponse.json(
            { error: label + ' artıq mövcud deyil. Zəhmət olmasa səbətinizi yeniləyin.' },
            { status: 409 }
          );
        }
        unitPrice = resolveUnitPrice(product, orderCurrency, clientItem.price);
      }

      serverSubtotal += unitPrice * qty;
      validatedItems.push({ ...clientItem, price: unitPrice, quantity: qty });
    }
    serverSubtotal = Math.round(serverSubtotal * 100) / 100;

    // Customer destination & address extraction
    const rawCountry = String(customer.country || '').trim();
    const rawCountryCode = String(customer.countryCode || '').trim().toUpperCase();

    let countryCode = 'AZ';
    if (rawCountryCode) {
      countryCode = rawCountryCode;
    } else if (rawCountry) {
      const match = getCountryByCode(rawCountry);
      countryCode = match ? match.code : (isDomesticDestination(rawCountry) ? 'AZ' : 'AZ');
    }

    const matchedCountry = getCountryByCode(countryCode);
    const countryName = matchedCountry ? matchedCountry.name : (countryCode === 'AZ' ? 'Azərbaycan' : countryCode);
    const isDomestic = isDomesticDestination(countryCode);

    const addressLine2 = customer.addressLine2
      ? String(customer.addressLine2).replace(/[<>]/g, '').trim().slice(0, 150)
      : undefined;
    const stateOrRegion = customer.stateOrRegion
      ? String(customer.stateOrRegion).replace(/[<>]/g, '').trim().slice(0, 100)
      : undefined;
    const postalCode = customer.postalCode
      ? String(customer.postalCode).replace(/[<>]/g, '').trim().slice(0, 30)
      : undefined;

    // 2. Server-side Shipping Calculation & Rate Verification
    const shippingCurrency: 'AZN' | 'USD' = requestedCurrency === 'USD' ? 'USD' : 'AZN';
    const clientShippingMethod = String(body.shippingMethod || '').trim();
    const city = String(customer.city || (isDomestic ? 'Bakı' : '')).trim();

    const defaultOptionId = isDomestic
      ? (/^(bak[ıi]|sumqay[ıi]t)/i.test(city) ? 'domestic_baku_sumgayit' : 'domestic_region')
      : 'intl_standard';
    const targetOptionId = clientShippingMethod || defaultOptionId;

    const claimedShippingRate = typeof body.shipping === 'number'
      ? Number(body.shipping)
      : (typeof body.shippingCost === 'number' ? Number(body.shippingCost) : undefined);

    const shippingValidation = validateShippingRate(
      countryCode,
      serverSubtotal,
      shippingCurrency,
      targetOptionId,
      claimedShippingRate !== undefined ? claimedShippingRate : -1,
      ((await getSettings()) as any).shipping
    );

    // Reject tampered shipping rates
    if (claimedShippingRate !== undefined && !shippingValidation.valid) {
      return NextResponse.json(
        {
          error: `Çatdırılma haqqı uyğunsuzluğu. Gözlənilən: ${shippingValidation.expectedRate} ${shippingCurrency}, təqdim edilən: ${claimedShippingRate} ${shippingCurrency}`,
        },
        { status: 400 }
      );
    }

    const serverShipping = shippingValidation.expectedRate;
    const validatedShippingOption = shippingValidation.option;

    // 3. Server-side Promo Code Validation (expiry, usage limit, minimum amount)
    const promoCheck = await checkPromo(promoCode, serverSubtotal);
    const serverDiscount = promoCheck.ok ? promoCheck.discount : 0;
    const validatedPromoCode = promoCheck.ok ? promoCheck.promo.code : null;

    const serverTotal = Math.max(0, Math.round((serverSubtotal - serverDiscount + serverShipping) * 100) / 100);

    // 4. Normalize Payment Method & Enforce COD Total Removal (Item 21)
    let method: PaymentMethod = 'card';
    const methodStr = String(rawMethod || '').toLowerCase();
    if (methodStr.includes('apple')) {
      method = 'apple_pay';
    } else if (methodStr.includes('google')) {
      method = 'google_pay';
    } else if (methodStr.includes('cod') || methodStr.includes('delivery') || methodStr.includes('çatdırılma') || methodStr.includes('nağd')) {
      method = 'cash_on_delivery';
    }

    // COD Gating Rules (Item 21: Completely disabled for ALL countries)
    if (method === 'cash_on_delivery') {
      return NextResponse.json(
        {
          error: 'Nağd ödəniş (COD) ləğv edilmişdir. Bütün sifarişlər təhlükəsiz onlayn ödənişlə qəbul olunur.',
        },
        { status: 400 }
      );
    }

    // 5. Duplicate Order Guard (double submit)
    const recentDuplicate = await findRecentDuplicate(customer?.phone || '', serverTotal);
    if (recentDuplicate) {
      return NextResponse.json({ success: true, order: recentDuplicate, duplicatePrevented: true });
    }

    const sanitizedCustomer = {
      fullName: String(customer.fullName || '').replace(/[<>]/g, '').trim().slice(0, 100),
      phone: String(customer.phone || '').replace(/[<>]/g, '').trim().slice(0, 30),
      email: String(customer.email || '').replace(/[<>]/g, '').trim().slice(0, 120),
      address: String(customer.address || '').replace(/[<>]/g, '').trim().slice(0, 250),
      addressLine2: addressLine2 || undefined,
      city: String(customer.city || (isDomestic ? 'Bakı' : '')).replace(/[<>]/g, '').trim().slice(0, 60),
      stateOrRegion: stateOrRegion || undefined,
      postalCode: postalCode || undefined,
      country: countryName,
      countryCode: countryCode,
    };

    // 6. Store the order first, so a payment can never exist without its order
    const provider = getActivePaymentProvider();
    const paymentMethodLabel =
      method === 'apple_pay' ? 'Apple Pay' : method === 'google_pay' ? 'Google Pay' : 'Bank Kartı (Visa/Mastercard)';

    let order: StoreOrder = await createOrder({
      userId: body.userId || undefined,
      customer: sanitizedCustomer,
      items: validatedItems.map((i) => ({
        productId: String(i.productId || i.id || ''),
        name: String(i.name || 'Məhsul').replace(/[<>]/g, '').slice(0, 200),
        size: String(i.size || '').replace(/[<>]/g, '').slice(0, 30),
        color: String(i.color || '').replace(/[<>]/g, '').slice(0, 60),
        price: i.price,
        quantity: i.quantity,
        isCustom: Boolean(i.isCustom),
        customData: i.isCustom ? i.customData || undefined : undefined,
      })),
      paymentMethod: paymentMethodLabel,
      paymentStatus: 'pending_payment',
      orderStatus: 'Yeni Sifariş',
      subtotal: serverSubtotal,
      shipping: serverShipping,
      shippingMethod: validatedShippingOption.id,
      shippingMethodLabel: validatedShippingOption.name,
      estimatedDelivery: validatedShippingOption.estimatedDays,
      discount: serverDiscount,
      total: serverTotal,
      isTest: isTestMode,
      provider: provider.name,
      promoCode: validatedPromoCode || undefined,
      currency: orderCurrency,
    });

    // 7. Execute Pluggable Payment Provider
    const paymentRequest: PaymentRequest = {
      orderId: order.id,
      amount: serverTotal,
      currency: orderCurrency,
      method,
      items: order.items.map((i) => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        type: i.isCustom ? 'custom' : 'ready',
        size: i.size,
        color: i.color,
      })),
      customer: {
        fullName: sanitizedCustomer.fullName,
        phone: sanitizedCustomer.phone,
        email: sanitizedCustomer.email,
        address: [sanitizedCustomer.address, sanitizedCustomer.addressLine2].filter(Boolean).join(', '),
        city: [sanitizedCustomer.city, sanitizedCustomer.stateOrRegion, sanitizedCustomer.postalCode].filter(Boolean).join(', '),
        country: sanitizedCustomer.country,
      },
      isTest: isTestMode,
      promoCode: validatedPromoCode,
      shippingCost: serverShipping,
      discountAmount: serverDiscount,
    };

    let paymentResponse;
    try {
      paymentResponse = await provider.createPayment(paymentRequest);
    } catch (paymentError) {
      await deleteOrder(order.id).catch(() => {});
      throw paymentError;
    }

    if (!paymentResponse.success) {
      await deleteOrder(order.id).catch(() => {});
      return NextResponse.json(
        { error: paymentResponse.message || 'Ödəniş təsdiqlənmədi.' },
        { status: 400 }
      );
    }

    order =
      (await updateOrder(order.id, {
        paymentStatus: paymentResponse.status,
        providerPaymentId: paymentResponse.transactionId,
      })) || order;

    // 8. Custom print items also become production jobs for the atelier
    for (const item of order.items) {
      if (!item.isCustom || !item.customData) continue;
      const custom = item.customData;
      try {
        await createPodOrder({
          orderId: order.id,
          customerName: sanitizedCustomer.fullName,
          customerPhone: sanitizedCustomer.phone,
          customerEmail: sanitizedCustomer.email,
          garmentType: custom.garmentType || item.name,
          garmentColor: item.color,
          size: item.size,
          price: item.price,
          placement: custom.placement || 'Sinə (Mərkəz)',
          customerNote: custom.customerNote || '',
          originalImage: custom.uploadedImage || custom.originalImage || '',
          previewImage: custom.previewImage || '',
          customData: custom,
          frontDesign: custom.frontDesign || {},
          backDesign: custom.backDesign || {},
          status: 'Pending Print',
        });
      } catch (podError) {
        // The design is still stored on the order item itself (custom_data).
        console.error('[Orders] POD job could not be created for', order.id, podError);
      }
    }

    if (validatedPromoCode) {
      await incrementPromoUses(validatedPromoCode).catch((e) => console.warn('Promo usage update failed:', e));
    }

    // Send instant mobile notification (Telegram)
    try {
      await notifyNewOrder(order);
    } catch (e) {
      console.warn('Notification failed:', e);
    }

    // Customer confirmation + shop alert. Awaited: on Vercel the function may be frozen
    // as soon as the response is sent, which would drop e-mails still in flight.
    await Promise.allSettled([
      sendOrderConfirmation(order).catch((e) => console.warn('Order confirmation email warning:', e)),
      sendNewOrderAlert(order).catch((e) => console.warn('New order alert warning:', e)),
    ]);

    return NextResponse.json({ success: true, order, paymentResponse });
  } catch (error: any) {
    if (error instanceof OutOfStockError) {
      return NextResponse.json({ error: error.message, outOfStock: true }, { status: 409 });
    }
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
    const order = await updateOrder(String(id || ''), { orderStatus, paymentStatus });
    if (!order) {
      return NextResponse.json({ error: 'Sifariş tapılmadı.' }, { status: 404 });
    }
    if (orderStatus) {
      await sendOrderStatusUpdate(order, orderStatus).catch((e) => console.warn('Status update email warning:', e));
    }
    return NextResponse.json({ success: true, order });
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

    if (searchParams.get('clearTest') === 'true') {
      const count = await deleteTestOrders();
      return NextResponse.json({ success: true, message: `${count} test sifarişi silindi.` });
    }

    if (searchParams.get('clearAll') === 'true') {
      await deleteAllOrders();
      return NextResponse.json({ success: true, message: 'Bütün sifarişlər təmizləndi.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Sifariş ID-si tələb olunur.' }, { status: 400 });
    }

    await deleteOrder(id);
    return NextResponse.json({ success: true, message: 'Sifariş silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
