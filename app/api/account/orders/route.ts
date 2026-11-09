import { NextRequest, NextResponse } from "next/server";
import { searchOrders } from "@/lib/db/orders";
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

    // SECURITY: Authenticate caller using Supabase JWT to prevent IDOR / unauthorized order history access
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (supabaseServer) {
      if (!token) {
        return NextResponse.json(
          { error: "İcazəsiz giriş: Hesaba daxil olun", orders: [] },
          { status: 401 }
        );
      }
      const { data: authData, error: authErr } = await supabaseServer.auth.getUser(token);
      if (authErr || !authData?.user) {
        return NextResponse.json(
          { error: "Etibarsız sessiya: Zəhmət olmasa yenidən daxil olun", orders: [] },
          { status: 401 }
        );
      }
      const verifiedEmail = (authData.user.email || "").toLowerCase();
      if (verifiedEmail && verifiedEmail !== cleanEmail) {
        return NextResponse.json(
          { error: "Qadağandır: Yalnız öz sifarişlərinizi görə bilərsiniz", orders: [] },
          { status: 403 }
        );
      }
    }

    const finalOrders = await searchOrders({ email: cleanEmail });

    return NextResponse.json({ success: true, orders: finalOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, orders: [] }, { status: 500 });
  }
}

