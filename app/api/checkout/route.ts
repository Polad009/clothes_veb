import { NextRequest, NextResponse } from "next/server";
import { defaultPaymentProvider, validatePaymentEligibility } from "@/lib/payments/provider";
import { PaymentRequest, OrderItem, PaymentMethod } from "@/lib/payments/types";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rateLimiter";
import { validateShippingRate, isDomesticDestination } from "@/lib/shipping";
import { getCountryByCode } from "@/lib/countries";
import { readStoreDb, writeStoreDb } from "@/lib/storeDb";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
    const rateCheck = checkRateLimit(`checkout_api_${clientIp}`, { limit: 12, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: "Həddindən artıq sorğu göndərildi. Zəhmət olmasa bir qədər gözləyin." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customer, method, items, turnstileToken, shippingMethod, shipping, currency, promoCode } = body as {
      customer: {
        fullName: string;
        phone: string;
        email?: string;
        address: string;
        addressLine2?: string;
        city: string;
        stateOrRegion?: string;
        postalCode?: string;
        country?: string;
        countryCode?: string;
      };
      method: PaymentMethod;
      items: OrderItem[];
      turnstileToken?: string;
      shippingMethod?: string;
      shipping?: number;
      currency?: "AZN" | "USD";
      promoCode?: string;
    };

    if (turnstileToken) {
      const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!turnstileCheck.success) {
        return NextResponse.json(
          { success: false, message: turnstileCheck.error || "Təhlükəsizlik bot yoxlaması təsdiqlənmədi." },
          { status: 403 }
        );
      }
    }

    // 1. Basic validation
    if (!customer?.fullName || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { success: false, message: "Zəhmət olmasa bütün tələb olunan sahələri doldurun." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Səbətiniz boşdur." },
        { status: 400 }
      );
    }

    // Resolve country
    const rawCountryCode = String(customer.countryCode || '').trim().toUpperCase();
    const rawCountry = String(customer.country || '').trim();
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

    // 2. CRITICAL SERVER-SIDE BUSINESS RULE ENFORCEMENT & COD GATING
    const eligibility = validatePaymentEligibility(items, method, { country: countryName, countryCode });
    if (!eligibility.valid) {
      return NextResponse.json(
        {
          success: false,
          message: eligibility.reason || "Seçilmiş ödəniş növü üçün məhdudiyyət mövcuddur.",
        },
        { status: 400 }
      );
    }

    if (method === 'cash_on_delivery') {
      return NextResponse.json(
        {
          success: false,
          message: "Nağd ödəniş (COD) ləğv edilmişdir. Bütün sifarişlər təhlükəsiz onlayn ödənişlə qəbul olunur.",
        },
        { status: 400 }
      );
    }

    // 3. Server-side Recalculation: Verify prices & subtotal against database (anti-tampering)
    const db = readStoreDb();
    let serverSubtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const clientItem of (items || [])) {
      const clientItemId = (clientItem as any).productId || clientItem.id || (clientItem as any).slug;
      const matchingProduct = (db.products || []).find(
        (p) => p.id === (clientItem as any).productId || p.id === clientItem.id || p.slug === (clientItem as any).slug || p.slug === clientItemId
      );
      const isCustom = Boolean((clientItem as any).isCustom || clientItem.type === 'custom');
      const unitPrice = isCustom
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

    const subtotal = Math.round(serverSubtotal * 100) / 100;
    const orderCurrency: "AZN" | "USD" = currency === "USD" ? "USD" : "AZN";

    const defaultOptionId = isDomestic
      ? (/^(bak[ıi]|sumqay[ıi]t)/i.test(String(customer.city || '')) ? 'domestic_baku_sumgayit' : 'domestic_region')
      : 'intl_standard';
    const targetOptionId = shippingMethod || defaultOptionId;

    const claimedShippingRate = typeof shipping === 'number' ? Number(shipping) : undefined;
    const shippingValidation = validateShippingRate(
      countryCode,
      subtotal,
      orderCurrency,
      targetOptionId,
      claimedShippingRate !== undefined ? claimedShippingRate : -1
    );

    // Reject tampered shipping rates
    if (claimedShippingRate !== undefined && !shippingValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: `Çatdırılma haqqı uyğunsuzluğu. Gözlənilən: ${shippingValidation.expectedRate} ${orderCurrency}, təqdim edilən: ${claimedShippingRate} ${orderCurrency}`,
        },
        { status: 400 }
      );
    }

    // 3.1 Promo Code Validation (Expiration & Max Uses Enforcement - Item 22)
    let serverDiscount = 0;
    let validatedPromoCode: string | null = null;
    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promoObj = (db.promoCodes || []).find(
        (p) => (p.code || '').trim().toUpperCase() === cleanCode
      );

      if (!promoObj || promoObj.active === false) {
        return NextResponse.json(
          { success: false, message: "Yanlış və ya deaktiv promokod." },
          { status: 400 }
        );
      }

      if (promoObj.expiresAt) {
        const expTime = new Date(promoObj.expiresAt).getTime();
        if (!isNaN(expTime) && Date.now() > expTime) {
          return NextResponse.json(
            { success: false, message: "Bu promokodun istifadə müddəti bitmişdir." },
            { status: 400 }
          );
        }
      }

      if (typeof promoObj.maxUses === 'number' && promoObj.maxUses > 0) {
        if ((Number(promoObj.uses) || 0) >= promoObj.maxUses) {
          return NextResponse.json(
            { success: false, message: "Bu promokodun maksimal istifadə sayı bitmişdir." },
            { status: 400 }
          );
        }
      }

      const minAmt = Number(promoObj.minAmount) || 0;
      if (minAmt > 0 && subtotal < minAmt) {
        return NextResponse.json(
          { success: false, message: `Minimum sifariş məbləği ${minAmt} ${orderCurrency} olmalıdır.` },
          { status: 400 }
        );
      }

      validatedPromoCode = promoObj.code;
      if (promoObj.type === 'fixed') {
        serverDiscount = Math.min(subtotal, Number(promoObj.value) || 0);
      } else {
        const pct = Math.min(100, Math.max(0, Number(promoObj.value) || 0));
        serverDiscount = (subtotal * pct) / 100;
      }
    }

    const serverShipping = shippingValidation.expectedRate;
    const totalAmount = Math.max(0, Math.round((subtotal - serverDiscount + serverShipping) * 100) / 100);
    const orderId = `ATL-${Date.now().toString().slice(-6)}`;

    const sanitizedCustomer = {
      fullName: String(customer.fullName || '').replace(/[<>]/g, '').trim().slice(0, 100),
      phone: String(customer.phone || '').replace(/[<>]/g, '').trim().slice(0, 30),
      email: String(customer.email || '').replace(/[<>]/g, '').trim().slice(0, 120),
      address: String(customer.address || '').replace(/[<>]/g, '').trim().slice(0, 250),
      addressLine2: customer.addressLine2 ? String(customer.addressLine2).replace(/[<>]/g, '').trim().slice(0, 150) : undefined,
      city: String(customer.city || (isDomestic ? 'Bakı' : '')).replace(/[<>]/g, '').trim().slice(0, 60),
      stateOrRegion: customer.stateOrRegion ? String(customer.stateOrRegion).replace(/[<>]/g, '').trim().slice(0, 100) : undefined,
      postalCode: customer.postalCode ? String(customer.postalCode).replace(/[<>]/g, '').trim().slice(0, 30) : undefined,
      country: countryName,
      countryCode: countryCode,
    };

    const paymentRequest: PaymentRequest = {
      orderId,
      amount: totalAmount,
      currency: orderCurrency,
      method,
      items: validatedItems,
      customer: {
        fullName: sanitizedCustomer.fullName,
        phone: sanitizedCustomer.phone,
        email: sanitizedCustomer.email,
        address: [sanitizedCustomer.address, sanitizedCustomer.addressLine2].filter(Boolean).join(", "),
        city: [sanitizedCustomer.city, sanitizedCustomer.stateOrRegion, sanitizedCustomer.postalCode].filter(Boolean).join(", "),
        country: sanitizedCustomer.country,
      },
      shippingCost: serverShipping,
    };

    // 4. Process payment through pluggable provider
    const paymentResponse = await defaultPaymentProvider.createPayment(paymentRequest);

    if (!paymentResponse.success) {
      return NextResponse.json(
        { success: false, message: paymentResponse.message || "Ödəniş xətası baş verdi." },
        { status: 400 }
      );
    }

    if (validatedPromoCode) {
      const promoToUpdate = (db.promoCodes || []).find(
        (p) => (p.code || '').trim().toUpperCase() === validatedPromoCode!.toUpperCase()
      );
      if (promoToUpdate) {
        promoToUpdate.uses = (Number(promoToUpdate.uses) || 0) + 1;
        try {
          writeStoreDb(db);
        } catch (e) {
          console.warn("Error incrementing promo code uses:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      transactionId: paymentResponse.transactionId,
      paymentUrl: paymentResponse.paymentUrl,
      message: paymentResponse.message,
      shipping: serverShipping,
      total: totalAmount,
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, message: "Server xətası baş verdi. Zəhmət olmasa yenidən cəhd edin." },
      { status: 500 }
    );
  }
}
