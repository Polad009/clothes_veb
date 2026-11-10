import { NextRequest, NextResponse } from "next/server";
import { findPodOrderByOrderId, searchOrders, searchPodOrders } from "@/lib/db/orders";
import { getCountryByCode } from "@/lib/countries";

export const dynamic = "force-dynamic";

// Helper to normalize phone numbers for searching (digits only)
function normalizePhone(phone: string): string {
  return (phone || "").replace(/[^0-9]/g, "");
}

// SECURITY: Mask PII (Personally Identifiable Information) in public order tracking
function maskName(name: string): string {
  if (!name || name === "Müştəri" || name === "-") return "Müştəri";
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => (p.length > 1 ? p[0] + "***" : p)).join(" ");
}

function maskPhone(phone: string): string {
  if (!phone || phone === "-") return "-";
  const trimmed = phone.trim();

  // If number starts with international prefix '+' or '00'
  const isPlus = trimmed.startsWith("+");
  const isDoubleZero = trimmed.startsWith("00");

  if (isPlus || isDoubleZero) {
    const normalized = isDoubleZero ? "+" + trimmed.slice(2).trim() : trimmed;
    // Extract country dial code (e.g. +1, +90, +44, +49, +994, etc.)
    const dialMatch = normalized.match(/^(\+\d{1,4})[\s.-]?(.*)$/);
    if (dialMatch) {
      const dialCode = dialMatch[1];
      const restDigits = (dialMatch[2] || "").replace(/\D/g, "");
      if (restDigits.length >= 4) {
        const lead = restDigits.slice(0, Math.min(2, restDigits.length - 2));
        const tail = restDigits.slice(-2);
        return `${dialCode} ${lead} *** ** ${tail}`;
      } else if (restDigits.length > 0) {
        return `${dialCode} ***`;
      }
      return `${dialCode} ***`;
    }
  }

  // Domestic or digits-only format
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("994") && digits.length >= 10) {
    const national = digits.slice(3);
    return "+994 " + national.slice(0, 2) + " *** ** " + national.slice(-2);
  }

  if (digits.length >= 7) {
    // If entered as local number without country code (e.g. 050..., 50...)
    const sliceStart = digits.length >= 9 ? -9 : -7;
    const lead = digits.slice(sliceStart, sliceStart + 2);
    const tail = digits.slice(-2);
    return "+994 " + lead + " *** ** " + tail;
  }

  return "***";
}

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "-";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return user[0] + "***@" + domain;
  return user.slice(0, 2) + "***@" + domain;
}

function maskAddress(addr: string): string {
  if (!addr || addr === "-") return "-";
  const parts = addr.split(",");
  if (parts.length > 1) {
    return parts[0].trim() + ", ***";
  }
  return addr.slice(0, Math.min(6, addr.length)) + " ***";
}

// Map textual order status to numerical stepper index (1 to 4)
function getStepIndex(status: string): { step: number; isCancelled: boolean; label: string; color: string } {
  const s = (status || "").toLowerCase();

  if (s.includes("ləğv") || s.includes("legv") || s.includes("cancel")) {
    return { step: 0, isCancelled: true, label: "Ləğv edildi", color: "rose" };
  }
  if (s.includes("çatdırıldı") || s.includes("catdirildi") || s.includes("tamam") || s.includes("delivered")) {
    return { step: 4, isCancelled: false, label: "Çatdırıldı", color: "emerald" };
  }
  if (s.includes("kuryer") || s.includes("yoldadır") || s.includes("yoldadir") || s.includes("courier") || s.includes("shipped")) {
    return { step: 3, isCancelled: false, label: "Kuryerdədir (Yoldadır)", color: "teal" };
  }
  // Older orders may still carry the retired "Çapda / Dərzidə" status: shown as confirmed
  if (s.includes("təsdiq") || s.includes("tesdiq") || s.includes("confirmed") || s.includes("çap") || s.includes("dərzi")) {
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

    // Orders live in one place only: the database.
    const found = await searchOrders(
      isEmailSearch ? { email: query } : isPhoneSearch ? { phoneDigits: cleanDigits } : { code: cleanQuery }
    );
    const matchedOrders: any[] = found.map((o) => ({ ...o, statusMeta: getStepIndex(o.orderStatus) }));

    const matchedPods = matchedOrders.length > 0 || isEmailSearch
      ? []
      : await searchPodOrders(isPhoneSearch ? { phoneDigits: cleanDigits } : { code: cleanQuery });

    if (matchedOrders.length > 0) {
      // Sort newest first
      matchedOrders.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const matchedOrder = matchedOrders[0];
      const statusMeta = matchedOrder.statusMeta || getStepIndex(matchedOrder.orderStatus);

      // Look for related POD design if any
      const relatedPod = await findPodOrderByOrderId(matchedOrder.id);

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
            fullName: maskName(matchedOrder.customer?.fullName || (matchedOrder.customer as any)?.name || "Müştəri"),
            phone: maskPhone(matchedOrder.customer?.phone || "-"),
            email: maskEmail(matchedOrder.customer?.email || "-"),
            city: matchedOrder.customer?.city || (matchedOrder.customer?.country && matchedOrder.customer.country !== "Azərbaycan" && matchedOrder.customer.country !== "Azerbaijan" ? "-" : "Bakı"),
            stateOrRegion: matchedOrder.customer?.stateOrRegion || (matchedOrder.customer as any)?.delivery_state || undefined,
            postalCode: matchedOrder.customer?.postalCode || (matchedOrder.customer as any)?.delivery_postal_code || undefined,
            country: matchedOrder.customer?.country || (matchedOrder.customer as any)?.delivery_country || (matchedOrder.customer?.countryCode ? getCountryByCode(matchedOrder.customer.countryCode)?.localName || matchedOrder.customer.countryCode : "Azərbaycan"),
            countryCode: matchedOrder.customer?.countryCode || undefined,
            address: maskAddress(matchedOrder.customer?.address || "-"),
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
            fullName: maskName(matchedPod.customerName || (matchedPod as any).customer?.name || "Müştəri"),
            phone: maskPhone(matchedPod.customerPhone || (matchedPod as any).customer?.phone || "-"),
            email: maskEmail((matchedPod as any).customerEmail || "-"),
            city: (matchedPod as any).city || "Bakı",
            country: (matchedPod as any).country || "Azərbaycan",
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
