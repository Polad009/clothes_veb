import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ətirlər",
  description: "Horwalle ətirləri: odunsu, amber və müşk notlu uniseks qoxular. Azərbaycan daxilində çatdırılma.",
  alternates: { canonical: "https://www.horwalle.com/etirler" },
  openGraph: {
    title: "Ətirlər | Horwalle",
    description: "Horwalle ətirləri: odunsu, amber və müşk notlu uniseks qoxular.",
    url: "https://www.horwalle.com/etirler",
  },
};

export default function PerfumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
