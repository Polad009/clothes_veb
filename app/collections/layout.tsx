import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Kolleksiyalar | Horwalle",
  description: "Horwalle (Horvvalle) lüks kişi köynəkləri, 3-iplik qalın hudilər, Chino və kətan şalvarlar, eksklüziv aksesuarlar.",
  alternates: {
    canonical: "https://www.horwalle.com/collections",
  },
  openGraph: {
    title: "Premium Kolleksiyalar | Horwalle",
    description: "Horwalle (Horvvalle) lüks kişi köynəkləri, 3-iplik qalın hudilər, Chino və kətan şalvarlar, eksklüziv aksesuarlar.",
    url: "https://www.horwalle.com/collections",
    images: ["https://www.horwalle.com/images/salvar-and-shortik-showcase.webp"],
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

