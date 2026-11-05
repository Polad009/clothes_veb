import { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D İnteraktiv Çap Studiyası | Horwalle Atelier",
  description: "Öz dizaynını, loqonu və ya istədiyin qrafikanı 3D formatda köynəyə yerləşdir və canlı fərdi atelye sifarişi ver.",
  alternates: {
    canonical: "https://www.horwalle.com/studio",
  },
  openGraph: {
    title: "3D İnteraktiv Çap Studiyası | Horwalle Atelier",
    description: "Öz dizaynını, loqonu və ya istədiyin qrafikanı 3D formatda köynəyə yerləşdir və canlı fərdi atelye sifarişi ver.",
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

