import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sifariş İzləmə | Horvvalle Atelier",
  description: "Horvvalle sifarişinizi unikal izləmə kodu ilə real vaxt rejimində izləyin.",
  alternates: {
    canonical: "https://www.horwalle.com/track",
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

