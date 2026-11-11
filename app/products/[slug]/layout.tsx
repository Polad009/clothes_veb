import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreSnapshot } from "@/lib/storeSnapshot";

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.horwalle.com").replace(/\/$/, "");

/** Search-engine and link-preview metadata, read from the live catalogue. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const canonicalUrl = `${SITE_URL}/products/${params.slug}`;
  const { products } = await getStoreSnapshot();
  const product = products.find((p) => p.slug === slug || p.id === slug);

  // removed or never-existing products answer 404 (checked here, before the page streams)
  if (!product) notFound();

  const title = product.name;
  const summary = product.description.replace(/\s+/g, " ").trim();
  const description = summary
    ? summary.length > 160
      ? `${summary.slice(0, 157).trimEnd()}…`
      : summary
    : `${product.name} — 100% premium keyfiyyət və dəqiq kəsim, Horwalle-də.`;
  const imageUrl = product.image.startsWith("http") ? product.image : `${SITE_URL}${product.image}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      url: canonicalUrl,
      title,
      description,
      siteName: "Horwalle",
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`);

/** Google product data: name, photos, price, stock. Shown as rich results in search. */
function productJsonLd(product: any) {
  const url = `${SITE_URL}/products/${product.slug}`;
  const images = Array.from(
    new Set([product.image, ...(product.images || []), ...(product.colors || []).map((c: any) => c.image)].filter(Boolean))
  ).slice(0, 8).map((u: any) => abs(String(u)));
  const tracked = Boolean(product.trackStock);
  const units = tracked ? Object.values(product.stock || {}).reduce((a: number, n: any) => a + (Number(n) || 0), 0) : 1;
  const available = product.inStock !== false && units > 0;
  const validUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: String(product.description || product.name).replace(/\s+/g, " ").trim().slice(0, 4900),
    sku: product.refCode || product.id,
    image: images,
    url,
    brand: { "@type": "Brand", name: "Horwalle" },
    ...(product.composition ? { material: product.composition } : {}),
    ...(product.colors?.length ? { color: product.colors.map((c: any) => c.name).join(", ") } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "AZN",
      price: Number(product.price).toFixed(2),
      priceValidUntil: validUntil,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const slug = decodeURIComponent(params.slug);
  const { products } = await getStoreSnapshot();
  const product = products.find((p) => p.slug === slug || p.id === slug);
  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          // escape "<" so product text can never close the script tag
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, String.fromCharCode(92) + "u003c") }}
        />
      )}
      {children}
    </>
  );
}
