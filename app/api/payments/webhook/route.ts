import { NextRequest, NextResponse } from "next/server";
import { getActivePaymentProvider } from "@/lib/payments";
import { supabaseServer } from "@/lib/supabaseServer";
import { readStoreDb, writeStoreDb } from "@/lib/storeDb";

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

    // 1. Update local database idempotently
    const db = readStoreDb();
    const existingIndex = (db.orders || []).findIndex((o: any) => o.id === orderId);
    if (existingIndex >= 0) {
      // Idempotency: if already paid, skip re-triggering
      if (db.orders[existingIndex].paymentStatus !== "paid") {
        db.orders[existingIndex].paymentStatus = status === "paid" ? "Paid" : status === "test_paid" ? "Test Paid" : "Failed";
        if (status === "paid" || status === "test_paid") {
          db.orders[existingIndex].orderStatus = "Təsdiqləndi";
        }
        writeStoreDb(db);
      }
    }

    // 2. Update Supabase database
    if (supabaseServer) {
      try {
        const updatePayload: any = {
          payment_status: status,
        };
        if (transactionId) {
          updatePayload.provider_payment_id = transactionId;
        }
        if (status === "paid" || status === "test_paid") {
          updatePayload.order_status = "Təsdiqləndi";
        }

        await supabaseServer.from("orders").update(updatePayload).eq("id", orderId);
      } catch (err) {
        console.warn("[Webhook] Supabase order update warning:", err);
      }
    }

    return NextResponse.json({ success: true, orderId, status });
  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

