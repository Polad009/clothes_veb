import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Ticker } from "@/components/Ticker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartDrawer } from "@/components/CartDrawer";
import { PageTransition } from "@/components/PageTransition";
import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/SmoothScroll";

import React, { Suspense } from "react";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#140702",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://horvvalle.com"),
  title: {
    default: "Horvvalle — Lüks Geyim & Fərdi Atelye | Rəsmi Mağaza",
    template: "%s | Horvvalle",
  },
  description: "Horvvalle — Sənin ölçün, sənin üslubun. Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.",
  keywords: [
    "Horvvalle",
    "Horvvalle atelye",
    "Lüks kişi köynəkləri",
    "3iplik premium hudi",
    "Chino şalvar",
    "Klassik geyim Bakı",
    "3D fərdi çap studiyası",
    "Online lüks geyim",
    "Azərbaycan atelye"
  ],
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "https://horvvalle.com",
    siteName: "Horvvalle",
    title: "Horvvalle — Lüks Geyim & Fərdi Atelye",
    description: "Horvvalle — Sənin ölçün, sənin üslubun. Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Horvvalle",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
        {/* Tiny inline script to decide intro state before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.location.search.indexOf('intro=1')!==-1){sessionStorage.removeItem('hv-intro');document.documentElement.dataset.intro='on';}else{document.documentElement.dataset.intro=sessionStorage.getItem('hv-intro')?'off':'on';}}catch(e){document.documentElement.dataset.intro='off';}})();`,
          }}
        />
      </head>
      <body className={`${ebGaramond.variable} min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1517] font-sans antialiased selection:bg-[#E6C280] selection:text-black`}>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <SmoothScroll>
                <Intro />
                <Suspense fallback={<div className="h-24 w-full bg-[#FAF7F2]" />}>
                  <Ticker />
                  <Header />
                </Suspense>
                <main id="main-content" className="flex-grow flex flex-col focus:outline-none">
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
                <CartDrawer />
              </SmoothScroll>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
