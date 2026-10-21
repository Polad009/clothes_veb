import { NextRequest, NextResponse } from "next/server";
import { defaultPaymentProvider, validatePaymentEligibility } from "@/lib/payments/provider";
import { PaymentRequest, OrderItem, PaymentMethod } from "@/lib/payments/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, method, items } = body as {
      customer: {
        fullName: string;
        phone: string;
        email?: string;
        address: string;
        city: string;
      };
      method: PaymentMethod;
      items: OrderItem[];
    };

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

    // 2. CRITICAL SERVER-SIDE BUSINESS RULE ENFORCEMENT
    // If ANY item is custom, cash_on_delivery is strictly rejected!
    const eligibility = validatePaymentEligibility(items, method);
    if (!eligibility.valid) {
      return NextResponse.json(
        {
          success: false,
          message: eligibility.reason || "Fərdi çap məhsulları üçün qapıda ödəniş qadağandır.",
        },
        { status: 400 }
      );
    }

    // 3. Compute total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ATL-${Date.now().toString().slice(-6)}`;

    const paymentRequest: PaymentRequest = {
      orderId,
      amount: totalAmount,
      currency: "AZN",
      method,
      items,
      customer,
    };

    // 4. Process payment through pluggable provider
    const paymentResponse = await defaultPaymentProvider.createPayment(paymentRequest);

    if (!paymentResponse.success) {
      return NextResponse.json(
        { success: false, message: paymentResponse.message || "Ödəniş xətası baş verdi." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      transactionId: paymentResponse.transactionId,
      paymentUrl: paymentResponse.paymentUrl,
      message: paymentResponse.message,
    });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, message: "Server xətası baş verdi. Zəhmət olmasa yenidən cəhd edin." },
      { status: 500 }
    );
  }
}
