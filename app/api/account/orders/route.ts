import { NextRequest, NextResponse } from "next/server";
import { readStoreDb } from "@/lib/storeDb";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || !email.includes("@")) {
      return NextResponse.json({ orders: [] });
    }

    const cleanEmail = email.trim().toLowerCase();
    let userOrders: any[] = [];

    // 1. Try fetching from Supabase PostgreSQL
    if (supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from("orders")
          .select("*, order_items(*)")
          .ilike("customer_email", cleanEmail)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          userOrders = data.map((row: any) => ({
            id: row.id,
            date: row.created_at,
            orderStatus: row.order_status || "Yeni Sifariş",
            total: Number(row.total_amount) || 0,
            paymentMethod: row.payment_method || "Kart",
            items: (row.order_items || []).map((it: any) => ({
              name: it.item_name,
              color: it.color,
              size: it.size,
              quantity: it.quantity,
              price: it.unit_price,
            })),
          }));
        }
      } catch (err) {
        console.warn("[AccountOrders] Supabase query notice:", err);
      }
    }

    // 2. Also search local DB for orders placed with this email (e.g. during offline/fallback sync)
    const db = readStoreDb();
    const localMatches = (db.orders || []).filter(
      (o: any) => (o.customer?.email || "").trim().toLowerCase() === cleanEmail
    );

    // Merge and deduplicate by ID
    const mergedMap = new Map<string, any>();
    userOrders.forEach((o) => mergedMap.set(String(o.id), o));
    localMatches.forEach((o) => {
      if (!mergedMap.has(String(o.id))) {
        mergedMap.set(String(o.id), o);
      }
    });

    const finalOrders = Array.from(mergedMap.values()).sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime();
      const timeB = new Date(b.date || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, orders: finalOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, orders: [] }, { status: 500 });
  }
}

