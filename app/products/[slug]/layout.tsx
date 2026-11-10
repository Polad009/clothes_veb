import { Metadata } from "next";
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

  if (!product) {
    return {
      title: "Məhsul",
      description: "Horwalle eksklüziv kolleksiyası.",
      alternates: { canonical: canonicalUrl },
    };
  }

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

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
