import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country")?.toUpperCase() ||
    request.headers.get("cf-ipcountry")?.toUpperCase() ||
    (request as any).geo?.country?.toUpperCase() ||
    "AZ";

  const isAzerbaijan = country === "AZ";

  return NextResponse.json({
    country,
    isAzerbaijan,
    defaultLang: isAzerbaijan ? "az" : "en",
    defaultCurrency: isAzerbaijan ? "AZN" : "USD",
  });
}
