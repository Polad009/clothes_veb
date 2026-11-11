import { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Dizayn Studiyası",
  description: "Öz dizaynını, loqonu və ya istədiyin qrafikanı 3D formatda köynəyə yerləşdir və öz dizaynınla sifariş ver.",
  alternates: {
    canonical: "https://www.horwalle.com/studio",
  },
  openGraph: {
    title: "3D Dizayn Studiyası | Horwalle",
    description: "Öz dizaynını, loqonu və ya istədiyin qrafikanı 3D formatda köynəyə yerləşdir və öz dizaynınla sifariş ver.",
    url: "https://www.horwalle.com/studio",
    images: ["https://www.horwalle.com/images/salvar-and-shortik-showcase.webp"],
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

