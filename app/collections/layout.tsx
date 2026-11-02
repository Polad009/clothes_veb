import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Kolleksiyalar | Horvvalle Atelier",
  description: "Horvvalle lüks kişi köynəkləri, 3-iplik qalın hudilər, Chino və kətan şalvarlar, eksklüziv aksesuarlar.",
  alternates: {
    canonical: "https://horvvalle.com/collections",
  },
  openGraph: {
    title: "Premium Kolleksiyalar | Horvvalle Atelier",
    description: "Horvvalle lüks kişi köynəkləri, 3-iplik qalın hudilər, Chino və kətan şalvarlar, eksklüziv aksesuarlar.",
    url: "https://horvvalle.com/collections",
    images: ["https://horvvalle.com/images/salvar-and-shortik-showcase.webp"],
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

