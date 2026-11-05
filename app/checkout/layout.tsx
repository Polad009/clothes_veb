import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sifarişi Rəsmiləşdir | Horvvalle Atelier",
  description: "Təhlükəsiz ödəniş və operativ çatdırılma ilə sifarişi tamamlayın.",
  alternates: {
    canonical: "https://www.horwalle.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

