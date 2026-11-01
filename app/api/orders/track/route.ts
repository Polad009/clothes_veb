import { NextRequest, NextResponse } from "next/server";
import { readStoreDb } from "@/lib/storeDb";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// Helper to normalize phone numbers for searching (digits only)
function normalizePhone(phone: string): string {
  return (phone || "").replace(/[^0-9]/g, "");
}

// Map textual order status to numerical stepper index (1 to 5)
function getStepIndex(status: string): { step: number; isCancelled: boolean; label: string; color: string } {
  const s = (status || "").toLowerCase();

  if (s.includes("ləğv") || s.includes("legv") || s.includes("cancel")) {
    return { step: 0, isCancelled: true, label: "Ləğv edildi", color: "rose" };
  }
  if (s.includes("çatdırıldı") || s.includes("catdirildi") || s.includes("tamam") || s.includes("delivered")) {
    return { step: 5, isCancelled: false, label: "Çatdırıldı", color: "emerald" };
  }
  if (s.includes("kuryer") || s.includes("yoldadır") || s.includes("yoldadir") || s.includes("courier") || s.includes("shipped")) {
    return { step: 4, isCancelled: false, label: "Kuryerdədir (Yoldadır)", color: "teal" };
  }
  if (s.includes("çap") || s.includes("cap") || s.includes("dərzi") || s.includes("derzi")) {
    return { step: 3, isCancelled: false, label: "Çapda / Dərzidə", color: "amber" };
  }
  if (s.includes("təsdiq") || s.includes("tesdiq") || s.includes("confirmed")) {
    return { step: 2, isCancelled: false, label: "Təsdiqləndi", color: "indigo" };
  }
  // Default: Yeni Sifariş / Qəbul edildi (STEP 1)
  return { step: 1, isCancelled: false, label: "Yeni Sifariş (Qəbul edildi)", color: "sky" };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || searchParams.get("orderId") || "").trim();
    const searchType = (searchParams.get("type") || "").toLowerCase(); // "email" | "phone" | "code"

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Axtarış üçün Sifariş nömrəsi, Telefon nömrəsi və ya E-poçt (Gmail) daxil edin" },
        { status: 400 }
      );
    }

    const cleanQuery = query.toUpperCase().replace(/^#/, "");
    const cleanDigits = normalizePhone(query);
    const isEmailSearch = searchType === "email" || query.includes("@");
    const isPhoneSearch = !isEmailSearch && (searchType === "phone" || (cleanDigits.length >= 7 && !/[A-Z]/i.test(query)));

    const db = readStoreDb();
    const localOrders = db.orders || [];
    const podOrders = db.podOrders || [];

    const matchedOrders: any[] = [];

    // 1. SEARCH LOCAL DATABASE
    const localMatches = localOrders.filter((o: any) => {
      const customerEmail = (o.customer?.email || "").trim().toLowerCase();
      const customerPhone = normalizePhone(o.customer?.phone || "");
      const orderId = (o.id || "").toUpperCase().replace(/^#/, "");
      const orderRef = (o.trackingCode || "").toUpperCase();

      if (isEmailSearch) {
        return customerEmail === query.toLowerCase();
      }

      if (isPhoneSearch) {
        if (!customerPhone || cleanDigits.length < 7) return false;
        if (customerPhone === cleanDigits) return true;
        if (cleanDigits.length >= 9 && customerPhone.length >= 9) {
          return customerPhone.slice(-9) === cleanDigits.slice(-9);
        }
        if (cleanDigits.length === 7 && customerPhone.length >= 7) {
          return customerPhone.slice(-7) === cleanDigits;
        }
        return false;
      }

      // Order code matching
      if (orderId === cleanQuery || orderRef === cleanQuery) return true;
      if (cleanQuery.length >= 4 && (orderId.includes(cleanQuery) || orderRef.includes(cleanQuery))) return true;

      if (cleanDigits.length >= 4 && cleanDigits.length <= 6) {
        const orderDigits = orderId.replace(/\D/g, "");
        const trackDigits = orderRef.replace(/\D/g, "");
        if (orderDigits === cleanDigits || trackDigits === cleanDigits) return true;
      }

      return false;
    });

    matchedOrders.push(...localMatches);

    // 2. SEARCH SUPABASE CLOUD DATABASE
    if (supabaseServer) {
      try {
        let supaQuery = supabaseServer.from("orders").select("*, order_items(*)");

        if (isEmailSearch) {
          supaQuery = supaQuery.ilike("customer_email", query.toLowerCase());
        } else if (isPhoneSearch) {
          supaQuery = supaQuery.ilike("customer_phone", `%${cleanDigits.slice(-7)}%`);
        } else {
          // By order code: match by ID
          supaQuery = supaQuery.ilike("id", `%${query.replace(/^#/, "")}%`);
        }

        const { data: supaData, error: supaError } = await supaQuery.order("created_at", { ascending: false });

        if (!supaError && supaData && supaData.length > 0) {
          const converted = supaData.map((so: any) => ({
            id: String(so.id),
            date: so.created_at,
            customer: {
              fullName: so.customer_name || "Müştəri",
              phone: so.customer_phone || "-",
              email: so.customer_email || "-",
              address: so.delivery_address || "-",
              city: so.delivery_city || "Bakı",
              country: "Azərbaycan",
            },
            items: (so.order_items || []).map((it: any) => ({
              name: it.item_name,
              color: it.color || "Standart",
              size: it.size || "L",
              quantity: it.quantity || 1,
              price: Number(it.unit_price) || 0,
            })),
            subtotal: Number(so.total_amount) || 0,
            shipping: 0,
            discount: 0,
            total: Number(so.total_amount) || 0,
            paymentMethod: so.payment_method || "Kart",
            paymentStatus: so.payment_status || "Ödənilib",
            orderStatus: so.order_status || "Yeni Sifariş",
            trackingCode: `AZ-EXP-${String(so.id).replace(/[^0-9]/g, "") || "8841"}`,
            statusMeta: getStepIndex(so.order_status),
            source: "Supabase",
          }));

          // Merge and deduplicate
          const existingIds = new Set(matchedOrders.map((o) => String(o.id)));
          for (const co of converted) {
            if (!existingIds.has(co.id)) {
              matchedOrders.push(co);
              existingIds.add(co.id);
            }
          }
        }
      } catch (err) {
        console.warn("[OrdersTrack] Supabase search notice:", err);
      }
    }

    // 3. SEARCH POD ORDERS (IF APPLICABLE)
    const matchedPods = podOrders.filter((p: any) => {
      const custPhone = normalizePhone(p.customerPhone || (p as any).customer?.phone || "");
      const podId = (p.id || "").toUpperCase().replace(/^#/, "");

      if (isPhoneSearch) {
        if (!custPhone || cleanDigits.length < 7) return false;
        if (custPhone === cleanDigits) return true;
        if (cleanDigits.length >= 9 && custPhone.length >= 9) {
          return custPhone.slice(-9) === cleanDigits.slice(-9);
        }
        if (cleanDigits.length === 7 && custPhone.length >= 7) {
          return custPhone.slice(-7) === cleanDigits;
        }
        return false;
      }

      if (podId === cleanQuery || (cleanQuery.length >= 4 && podId.includes(cleanQuery))) return true;
      return false;
    });

    if (matchedOrders.length > 0) {
      // Sort newest first
      matchedOrders.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const matchedOrder = matchedOrders[0];
      const statusMeta = matchedOrder.statusMeta || getStepIndex(matchedOrder.orderStatus);

      // Look for related POD design if any
      const relatedPod = podOrders.find((p: any) => p.orderId === matchedOrder.id);

      // Lightweight list of all matching orders (if multiple orders found for this email/phone)
      const allMatches = matchedOrders.map((o: any) => ({
        id: o.id,
        date: o.date,
        total: o.total,
        orderStatus: o.orderStatus || "Yeni Sifariş",
        itemsCount: o.items?.length || 1,
        trackingCode: o.trackingCode || `AZ-EXP-${(o.id || "").replace(/[^0-9]/g, "") || "8841"}`,
        statusMeta: o.statusMeta || getStepIndex(o.orderStatus),
      }));

      return NextResponse.json({
        success: true,
        order: {
          id: matchedOrder.id,
          date: matchedOrder.date,
          customer: {
            fullName: matchedOrder.customer?.fullName || (matchedOrder.customer as any)?.name || "Müştəri",
            phone: matchedOrder.customer?.phone || "-",
            email: matchedOrder.customer?.email || "-",
            city: matchedOrder.customer?.city || "Bakı",
            address: matchedOrder.customer?.address || "-",
          },
          items: matchedOrder.items || [],
          paymentMethod: matchedOrder.paymentMethod || "card",
          paymentStatus: matchedOrder.paymentStatus || "Ödənilib",
          subtotal: matchedOrder.subtotal || matchedOrder.total,
          shipping: matchedOrder.shipping || 0,
          total: matchedOrder.total,
          orderStatus: matchedOrder.orderStatus || "Yeni Sifariş",
          trackingCode: matchedOrder.trackingCode || `AZ-EXP-${(matchedOrder.id || "").replace(/[^0-9]/g, "") || "8841"}`,
          statusMeta,
          relatedPod: relatedPod
            ? {
                garmentType: relatedPod.garmentType,
                garmentColor: relatedPod.garmentColor,
                size: relatedPod.size,
                frontArtwork: relatedPod.frontDesign?.uploadedImage || relatedPod.frontDesign?.artworkUrl,
                originalImage: relatedPod.frontDesign?.originalImage,
              }
            : null,
        },
        matchedOrdersCount: matchedOrders.length,
        allMatches: allMatches.length > 1 ? allMatches : undefined,
      });
    }

    if (matchedPods.length > 0) {
      const matchedPod = matchedPods[0];
      const statusMeta = getStepIndex(matchedPod.status);
      return NextResponse.json({
        success: true,
        order: {
          id: matchedPod.id,
          date: matchedPod.createdAt,
          customer: {
            fullName: matchedPod.customerName || (matchedPod as any).customer?.name || "Müştəri",
            phone: matchedPod.customerPhone || (matchedPod as any).customer?.phone || "-",
            email: (matchedPod as any).customerEmail || "-",
            city: "Bakı",
            address: "Atelyedən təhvil / Çatdırılma",
          },
          items: [
            {
              name: `Fərdi Dizayn: ${matchedPod.garmentType || "T-Shirt"}`,
              size: matchedPod.size || "L",
              color: matchedPod.garmentColor || "Ağ",
              quantity: 1,
              price: matchedPod.price || 15,
            },
          ],
          paymentMethod: "card",
          paymentStatus: "Ödənilib",
          total: matchedPod.price || 15,
          orderStatus: matchedPod.status || "Yeni Sifariş",
          trackingCode: `POD-TRACK-${(matchedPod.id || "").replace(/[^0-9]/g, "")}`,
          statusMeta,
          relatedPod: {
            garmentType: matchedPod.garmentType,
            garmentColor: matchedPod.garmentColor,
            size: matchedPod.size,
            frontArtwork: matchedPod.frontDesign?.uploadedImage || matchedPod.frontDesign?.artworkUrl,
            originalImage: matchedPod.frontDesign?.originalImage,
          },
        },
      });
    }

    let notFoundMsg = `"${query}" kodlu heç bir sifariş tapılmadı. Sifariş kodunuzu bilmirsinizsə, telefon nömrəniz və ya qeydiyyatdan keçdiyiniz e-poçt ünvanınızla axtarış edə bilərsiniz.`;
    if (isEmailSearch) {
      notFoundMsg = `"${query}" e-poçt (Gmail) ünvanı ilə heç bir aktiv sifariş tapılmadı. Sifariş verdiyiniz zaman istifadə etdiyiniz düzgün elektron poçt ünvanını daxil edin.`;
    } else if (isPhoneSearch) {
      notFoundMsg = `"${query}" telefon nömrəsi ilə heç bir sifariş tapılmadı. Zəhmət olmasa sifariş zamanı qeyd etdiyiniz mobil nömrənizi düzgün daxil edin.`;
    }

    return NextResponse.json(
      {
        success: false,
        error: notFoundMsg,
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
