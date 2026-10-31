import { NextRequest, NextResponse } from "next/server";
import { readStoreDb, writeStoreDb, StoreOrder } from "@/lib/storeDb";

export const dynamic = "force-dynamic";

// Helper to normalize phone numbers for searching
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
  if (s.includes("çap") || s.includes("cap") || s.includes("dərzi") || s.includes("derzi") || s.includes("hazır") || s.includes("processing") || s.includes("production")) {
    return { step: 3, isCancelled: false, label: "Dərzidə / Çapdadır", color: "amber" };
  }
  if (s.includes("təsdiq") || s.includes("tesdiq") || s.includes("confirmed")) {
    return { step: 2, isCancelled: false, label: "Təsdiqləndi", color: "indigo" };
  }
  // Default: Yeni Sifariş / Qəbul edildi
  return { step: 1, isCancelled: false, label: "Qəbul edildi", color: "sky" };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("orderId") || "";

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: "Axtarış üçün Sifariş nömrəsi və ya Telefon daxil edin" },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim().toUpperCase().replace(/^#/, "");
    const cleanPhoneQuery = normalizePhone(query);
    const lowerQuery = query.trim().toLowerCase();

    // Read store database via persistent store helper (supports in-memory & /tmp serverless fallbacks)
    const db = readStoreDb();
    const orders = db.orders || [];
    const podOrders = db.podOrders || [];

    // Match all standard orders matching query by ID, Tracking Code, Phone, Email, or Name
    const matchedOrders = orders.filter((o: any) => {
      const orderId = (o.id || "").toUpperCase().replace(/^#/, "");
      const orderRef = (o.trackingCode || "").toUpperCase();
      const customerPhone = normalizePhone(o.customer?.phone || "");
      const customerEmail = (o.customer?.email || "").toLowerCase();
      const customerName = (o.customer?.fullName || (o.customer as any)?.name || "").toLowerCase();

      // 1. Order ID or Tracking Reference Exact & Partial Match
      if (orderId === cleanQuery || orderId.includes(cleanQuery) || cleanQuery.includes(orderId)) return true;
      if (orderRef && (orderRef === cleanQuery || orderRef.includes(cleanQuery) || cleanQuery.includes(orderRef))) return true;

      // Extract numeric components for digits matching (e.g. 5374 matching VTX-ORD-5374 or AZ-EXP-5374)
      const queryDigits = cleanPhoneQuery;
      const orderDigits = orderId.replace(/\D/g, "");
      const trackDigits = orderRef.replace(/\D/g, "");

      if (queryDigits.length >= 4) {
        if (orderDigits === queryDigits || trackDigits === queryDigits) return true;
        if (orderDigits.includes(queryDigits) || queryDigits.includes(orderDigits)) return true;
        if (trackDigits && (trackDigits.includes(queryDigits) || queryDigits.includes(trackDigits))) return true;
      }

      // 2. Email Address
      if (customerEmail && (customerEmail === lowerQuery || (lowerQuery.includes("@") && customerEmail.includes(lowerQuery)))) {
        return true;
      }

      // 3. Phone Number (comparing normalized numeric strings)
      if (cleanPhoneQuery.length >= 6) {
        if (customerPhone.includes(cleanPhoneQuery) || cleanPhoneQuery.includes(customerPhone)) return true;
        // Last 7 digits match (Azerbaijani subscriber number match e.g. 1234567 vs +994501234567 vs 0501234567)
        if (cleanPhoneQuery.length >= 7 && customerPhone.length >= 7) {
          if (customerPhone.slice(-7) === cleanPhoneQuery.slice(-7)) return true;
        }
        // Last 9 digits match (Operator + subscriber e.g. 501234567 vs 0501234567)
        if (cleanPhoneQuery.length >= 9 && customerPhone.length >= 9) {
          if (customerPhone.slice(-9) === cleanPhoneQuery.slice(-9)) return true;
        }
      }

      // 4. Customer Name (if query is at least 3 chars and not purely digits)
      if (lowerQuery.length >= 3 && isNaN(Number(query.trim())) && !lowerQuery.includes("-")) {
        if (customerName.includes(lowerQuery)) return true;
      }

      return false;
    });

    // Match POD orders by ID, Phone, or Email
    const matchedPods = podOrders.filter((p: any) => {
      const podId = (p.id || "").toUpperCase().replace(/^#/, "");
      const custPhone = normalizePhone(p.customerPhone || p.customer?.phone || "");
      const custEmail = (p.customerEmail || p.customer?.email || "").toLowerCase();
      const custName = (p.customerName || p.customer?.name || "").toLowerCase();

      if (podId === cleanQuery || podId.includes(cleanQuery) || cleanQuery.includes(podId)) return true;
      if (custEmail && (custEmail === lowerQuery || (lowerQuery.includes("@") && custEmail.includes(lowerQuery)))) return true;
      
      if (cleanPhoneQuery.length >= 6) {
        if (custPhone.includes(cleanPhoneQuery) || cleanPhoneQuery.includes(custPhone)) return true;
        if (cleanPhoneQuery.length >= 7 && custPhone.length >= 7 && custPhone.slice(-7) === cleanPhoneQuery.slice(-7)) return true;
        if (cleanPhoneQuery.length >= 9 && custPhone.length >= 9 && custPhone.slice(-9) === cleanPhoneQuery.slice(-9)) return true;
      }
      if (lowerQuery.length >= 3 && isNaN(Number(query.trim())) && !lowerQuery.includes("-")) {
        if (custName.includes(lowerQuery)) return true;
      }
      return false;
    });

    if (matchedOrders.length > 0) {
      // Sort newest first
      matchedOrders.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const matchedOrder = matchedOrders[0];
      const statusMeta = getStepIndex(matchedOrder.orderStatus);
      
      // Look for related POD design if any
      const relatedPod = podOrders.find((p: any) => p.orderId === matchedOrder.id);

      // Lightweight list of all matching orders (if multiple orders found for this phone/email)
      const allMatches = matchedOrders.map((o: any) => ({
        id: o.id,
        date: o.date,
        total: o.total,
        orderStatus: o.orderStatus || "Yeni Sifariş",
        itemsCount: o.items?.length || 1,
        trackingCode: o.trackingCode || `AZ-EXP-${(o.id || "").replace(/[^0-9]/g, "") || "8841"}`,
        statusMeta: getStepIndex(o.orderStatus),
      }));

      return NextResponse.json({
        success: true,
        order: {
          id: matchedOrder.id,
          date: matchedOrder.date,
          customer: {
            fullName: matchedOrder.customer?.fullName || (matchedOrder.customer as any)?.name || "Müştəri",
            phone: matchedOrder.customer?.phone || "-",
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

    // Also allow searching directly by POD ID or customer details in POD orders
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

    return NextResponse.json(
      {
        success: false,
        error: `"${query}" üzrə heç bir sifariş tapılmadı. Əgər izləmə kodunu unutmusunuzsa, zəhmət olmasa sifariş zamanı qeyd etdiyiniz telefon nömrənizi (+994...) və ya e-poçt ünvanınızı daxil edin.`,
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Sync/Restore order from client localStorage back into server memory (Serverless resurrection)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = body.order;
    if (!order || !order.id) {
      return NextResponse.json({ success: false, error: "Etibarsız sifariş məlumatı" }, { status: 400 });
    }

    const db = readStoreDb();
    if (!Array.isArray(db.orders)) {
      db.orders = [];
    }

    const existingIdx = db.orders.findIndex((o) => o.id === order.id);
    if (existingIdx >= 0) {
      db.orders[existingIdx] = { ...db.orders[existingIdx], ...order };
    } else {
      db.orders.unshift(order);
    }

    writeStoreDb(db);
    return NextResponse.json({ success: true, message: "Sifariş serverdə bərpa edildi" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
