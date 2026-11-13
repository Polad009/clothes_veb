import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orijinallıq yoxlaması",
  description: "Horwalle geyiminin orijinal olub-olmadığını etiketdəki QR kodla yoxlayın.",
  robots: { index: false, follow: false },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[75vh] w-full bg-ink">{children}</div>;
}
