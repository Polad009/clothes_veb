import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkUnit, CODE_RE, normalizeCode, visitorId } from "@/lib/db/authenticity";
import { findProduct } from "@/lib/db/products";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import { whatsappNumber } from "@/lib/contact";
import { VerifyResult, type VerifyData, type VerifyStatus } from "@/components/store/VerifyView";

export const dynamic = "force-dynamic";

// Link previews (a code pasted in WhatsApp, Telegram…) must not count as a scan.
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|slack|discord|skype|vkshare|preview|embedly|quora|pinterest|headless/i;

// Many different people checking one code means the label was probably copied.
const WARN_VISITORS = 5;
const WARN_COUNTRIES = 3;

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const h = headers();
  const code = normalizeCode(decodeURIComponent(params.code || ""));
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const settings = (await getStoreSnapshot()).settings;
  const base: Pick<VerifyData, "code" | "supportNumber"> = { code, supportNumber: whatsappNumber(settings) };

  if (!CODE_RE.test(code)) {
    return <VerifyResult data={{ ...base, status: "unknown" }} />;
  }

  // a code is 130 random bits; this only stops someone hammering the page
  const limit = checkRateLimit(`verify:${ip}`, { maxPerWindow: 20, dailyQuota: 300 });
  if (!limit.success) {
    return <VerifyResult data={{ ...base, status: "limited" }} />;
  }

  let city = h.get("x-vercel-ip-city") || "";
  try { city = decodeURIComponent(city); } catch {}
  const result = await checkUnit(code, {
    count: !BOT_RE.test(h.get("user-agent") || ""),
    country: (h.get("x-vercel-ip-country") || "").toUpperCase(),
    city,
    visitor: visitorId(ip),
  });

  if (!result) {
    return <VerifyResult data={{ ...base, status: "unknown" }} />;
  }

  const { unit, visitors, countries } = result;
  const status: VerifyStatus =
    unit.status === "void" ? "void" : visitors >= WARN_VISITORS || countries >= WARN_COUNTRIES ? "warning" : "genuine";

  const product = unit.productId ? await findProduct(unit.productId) : null;
  const colorImage = product?.colors?.find((c: any) => c?.name === unit.color)?.image;

  return (
    <VerifyResult
      data={{
        ...base,
        status,
        serial: unit.serial,
        color: unit.color,
        size: unit.size,
        firstScannedAt: unit.firstScannedAt,
        scanCount: unit.scanCount,
        product: product
          ? {
              name: product.name,
              translations: product.translations as any,
              image: colorImage || product.image,
              href: product.hidden ? null : `/products/${product.slug}`,
              composition: product.composition,
              care: product.care,
            }
          : null,
      }}
    />
  );
}
