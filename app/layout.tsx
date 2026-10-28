import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Ticker } from "@/components/Ticker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { StoreDataProvider } from "@/context/StoreDataContext";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/PageTransition";
import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/SmoothScroll";

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

import React, { Suspense } from "react";
import { EB_Garamond, Fraunces, Instrument_Sans } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#090707",
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
  icons: {
    icon: [
      { url: "/brand/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon.png?v=3",
    apple: "/brand/favicon.png?v=3",
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
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="512x512" href="/brand/favicon.png?v=3" />
        <link rel="apple-touch-icon" href="/brand/favicon.png?v=3" />
      </head>
      <body className={`${ebGaramond.variable} ${fraunces.variable} ${instrumentSans.variable} min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1517] font-sans antialiased selection:bg-[#E6C280] selection:text-black`}>
        <Intro />
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <StoreDataProvider>
                <SmoothScroll>
                  <Suspense fallback={<div className="h-24 w-full bg-transparent" />}>
                    <Ticker />
                    <Header />
                  </Suspense>
                  <main id="main-content" className="flex-grow flex flex-col focus:outline-none">
                    {children}
                  </main>
                  <Footer />
                  <CartDrawer />
                </SmoothScroll>
              </StoreDataProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
