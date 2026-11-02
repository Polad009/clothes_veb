import { Metadata } from "next";
import storeData from "@/data/storeData.json";

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const products = (storeData as any).products || [];
  const product = products.find((p: any) => p.slug === params.slug);

  if (!product) {
    return {
      title: "Məhsul | Horvvalle Atelier",
      description: "Horvvalle Atelier eksklüziv kolleksiyası.",
      alternates: {
        canonical: `https://horvvalle.com/products/${params.slug}`,
      },
    };
  }

  const title = `${product.name} | Horvvalle Atelier`;
  const description =
    product.description ||
    `${product.name} — 100% premium keyfiyyət və fərdi dərzilik kəsimi ilə Horvvalle Atelier-də.`;
  const canonicalUrl = `https://horvvalle.com/products/${params.slug}`;

  // Find primary image
  let imageUrl = product.image;
  if (!imageUrl && product.colors && product.colors.length > 0) {
    imageUrl = product.colors[0].image;
  }
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `https://horvvalle.com${imageUrl}`
    : "https://horvvalle.com/images/salvar-and-shortik-showcase.webp";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      url: canonicalUrl,
      title,
      description,
      siteName: "Horvvalle Atelier",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
    },
  };
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}

