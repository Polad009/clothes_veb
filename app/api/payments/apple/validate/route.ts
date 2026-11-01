import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { validationURL } = body;

    if (!validationURL) {
      return NextResponse.json(
        { error: "validationURL tələb olunur." },
        { status: 400 }
      );
    }

    const merchantIdentifier = process.env.APPLE_PAY_MERCHANT_ID || "merchant.com.horvvalle";
    const certPem = process.env.APPLE_PAY_CERTIFICATE_PEM;
    const keyPem = process.env.APPLE_PAY_PRIVATE_KEY_PEM;

    // Check if certificates are provided for live Apple merchant validation
    if (!certPem || !keyPem) {
      const isTest = process.env.PAYMENT_MODE !== "live";
      return NextResponse.json({
        success: isTest,
        message: isTest
          ? "TEST MODE: Apple Merchant sertifikatları (.env.local-da APPLE_PAY_CERTIFICATE_PEM / APPLE_PAY_PRIVATE_KEY_PEM) hələ əlavə edilməyib. Real Apple Pay sheet yalnız Apple Developer Portal-dan yüklənmiş mTLS sertifikatı ilə aktivləşir."
          : "APPLE_PAY_CERTIFICATE_PEM və ya APPLE_PAY_PRIVATE_KEY_PEM çatışmır.",
        merchantIdentifier,
        isTest,
      });
    }

    // Perform mTLS call to Apple Validation Server
    const payload = JSON.stringify({
      merchantIdentifier,
      displayName: "HORVVALLE Atelier",
      initiative: "web",
      initiativeContext: req.headers.get("host") || "horvvalle.com",
    });

    const agent = new https.Agent({
      cert: certPem,
      key: keyPem,
    });

    const response = await fetch(validationURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      // @ts-ignore
      agent,
    });

    const sessionData = await response.json();
    return NextResponse.json(sessionData);
  } catch (error: any) {
    console.error("[ApplePayValidate] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

