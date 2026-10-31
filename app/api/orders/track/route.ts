import { NextRequest, NextResponse } from "next/server";
import { readStoreDb, writeStoreDb, StoreOrder } from "@/lib/storeDb";

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
    const searchType = searchParams.get("type") || ""; // "phone" or "code"

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Axtarış üçün Sifariş nömrəsi və ya Telefon nömrənizi daxil edin" },
        { status: 400 }
      );
    }

    const cleanQuery = query.toUpperCase().replace(/^#/, "");
    const cleanDigits = normalizePhone(query);

    // Strict detection: Is this a phone number search?
    const isPhoneSearch = searchType === "phone" || (cleanDigits.length >= 7 && !/[A-Z]/i.test(query));

    // Read store database via persistent store helper
    const db = readStoreDb();
    const orders = db.orders || [];
    const podOrders = db.podOrders || [];

    // Match orders based on exact mode
    const matchedOrders = orders.filter((o: any) => {
      const customerPhone = normalizePhone(o.customer?.phone || "");
      const orderId = (o.id || "").toUpperCase().replace(/^#/, "");
      const orderRef = (o.trackingCode || "").toUpperCase();

      if (isPhoneSearch) {
        // STRICT PHONE MATCHING ONLY:
        // Do NOT match order IDs or other random fields.
        if (!customerPhone || cleanDigits.length < 7) return false;

        // Exactly identical digits
        if (customerPhone === cleanDigits) return true;

        // Match by last 9 digits (operator prefix + 7 subscriber digits e.g. 501234567)
        if (cleanDigits.length >= 9 && customerPhone.length >= 9) {
          return customerPhone.slice(-9) === cleanDigits.slice(-9);
        }

        // Match by last 7 subscriber digits if user entered only 7 digits
        if (cleanDigits.length === 7 && customerPhone.length >= 7) {
          return customerPhone.slice(-7) === cleanDigits;
        }

        return false;
      }

      // ORDER CODE MATCHING:
      if (orderId === cleanQuery || orderRef === cleanQuery) return true;
      if (cleanQuery.length >= 4 && (orderId.includes(cleanQuery) || orderRef.includes(cleanQuery))) return true;

      // Pure 4+ digit numeric code (e.g. user entered "9064")
      if (cleanDigits.length >= 4 && cleanDigits.length <= 6) {
        const orderDigits = orderId.replace(/\D/g, "");
        const trackDigits = orderRef.replace(/\D/g, "");
        if (orderDigits === cleanDigits || trackDigits === cleanDigits) return true;
      }

      return false;
    });

    // Also match POD orders if any
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
      const statusMeta = getStepIndex(matchedOrder.orderStatus);
      
      // Look for related POD design if any
      const relatedPod = podOrders.find((p: any) => p.orderId === matchedOrder.id);

      // Lightweight list of all matching orders (if multiple orders found for this phone)
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

    const notFoundMsg = isPhoneSearch
      ? `"${query}" telefon nömrəsi ilə heç bir sifariş tapılmadı. Zəhmət olmasa sifariş zamanı qeyd etdiyiniz mobil nömrənizi düzgün daxil edin.`
      : `"${query}" kodlu heç bir sifariş tapılmadı. Sifariş kodunuzu bilmirsinizsə, telefon nömrənizlə axtarış edə bilərsiniz.`;

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
