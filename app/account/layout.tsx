import type { Metadata } from "next";

// Personal page: keep it out of search results
export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.horwalle.com/account" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
