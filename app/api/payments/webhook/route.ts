import { NextRequest, NextResponse } from "next/server";
import { getActivePaymentProvider } from "@/lib/payments";
import { findOrder, updateOrder } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const headersList: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersList[key.toLowerCase()] = value;
    });

    const provider = getActivePaymentProvider();
    const verification = await provider.verifyWebhook(rawBody, headersList);

    if (!verification.valid) {
      console.warn("[Webhook] Invalid signature or payload rejected by provider:", provider.name);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { orderId, transactionId, status } = verification;
    if (!orderId) {
      return NextResponse.json({ success: true, message: "Webhook acknowledged, no orderId found" });
    }

    console.log(`[Webhook] Processing payment status '${status}' for order '${orderId}' via ${provider.name}`);

    const existing = await findOrder(orderId);
    if (!existing) {
      console.warn(`[Webhook] Order '${orderId}' not found`);
      return NextResponse.json({ success: true, message: "Webhook acknowledged, order not found" });
    }

    // Idempotency: a paid order is never downgraded or re-confirmed by a repeated webhook
    const alreadyPaid = ["paid", "test_paid"].includes(String(existing.paymentStatus).toLowerCase());
    if (!alreadyPaid) {
      const isPaid = status === "paid" || status === "test_paid";
      await updateOrder(orderId, {
        paymentStatus: status,
        providerPaymentId: transactionId || undefined,
        orderStatus: isPaid ? "Təsdiqləndi" : undefined,
      });
    }

    return NextResponse.json({ success: true, orderId, status });
  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

