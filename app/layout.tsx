import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Ticker } from "@/components/Ticker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { StoreDataProvider } from "@/context/StoreDataContext";
import { AuthProvider } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/PageTransition";
import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/SmoothScroll";

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

import React, { Suspense } from "react";

export const viewport: Viewport = {
  themeColor: "#090707",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.horwalle.com"),
  title: {
    default: "Horwalle (Horvvalle) — Lüks Geyim & Fərdi Atelye | Rəsmi Mağaza",
    template: "%s | Horwalle Atelier",
  },
  alternates: {
    canonical: "https://www.horwalle.com",
  },
  verification: {
    google: "PAZrvm8cUAb0FsO13SzE-2mG5DVfRdT8P5eP4xF7SwI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32x32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon.png?v=4", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/brand/favicon.png?v=4", type: "image/png" }],
    apple: [{ url: "/brand/favicon.png?v=4", sizes: "512x512", type: "image/png" }],
    other: [
      { rel: "icon", url: "/brand/favicon.png?v=4", type: "image/png" },
    ],
  },
  description: "Horwalle (Horvvalle Atelier) — Sənin ölçün, sənin üslubun. Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.",
  keywords: [
    "Horwalle",
    "www.horwalle.com",
    "Horwalle atelye",
    "Horvvalle",
    "Horvvalle atelye",
    "Horwalle baku",
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
    url: "https://www.horwalle.com",
    siteName: "Horwalle Atelier",
    title: "Horwalle (Horvvalle) — Lüks Geyim & Fərdi Atelye",
    description: "Horwalle (Horvvalle Atelier) — Sənin ölçün, sənin üslubun. Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.",
    images: [
      {
        url: "https://www.horwalle.com/images/categories/salvar-and-shortik-showcase.webp",
        width: 1200,
        height: 630,
        alt: "Horwalle Atelier Luxury Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Horwalle (Horvvalle) — Lüks Geyim & Fərdi Atelye",
    description: "Horwalle (Horvvalle Atelier) — Sənin ölçün, sənin üslubun. Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.",
    images: ["https://www.horwalle.com/images/categories/salvar-and-shortik-showcase.webp"],
  },
};

import { StoreShell } from "@/components/StoreShell";
import { Analytics } from "@/components/Analytics";

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
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Fraunces:opsz,wght@9..144,300..900&family=Instrument+Sans:wght@400..700&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Fraunces:opsz,wght@9..144,300..900&family=Instrument+Sans:wght@400..700&display=swap"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="512x512" href="/brand/favicon.png?v=3" />
        <link rel="apple-touch-icon" href="/brand/favicon.png?v=3" />
        {/* Google Search Rich Snippets & Knowledge Graph Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://horvvalle.com/#organization",
                  "name": "Horvvalle",
                  "url": "https://horvvalle.com",
                  "logo": "https://horvvalle.com/brand/icon-dark.png",
                  "description": "Lüks Geyim & Fərdi Atelye. Dərzilik və 3D canlı çap studiyası.",
                  "sameAs": [
                    "https://instagram.com/horvvalle",
                    "https://facebook.com/horvvalle",
                    "https://tiktok.com/@horvvalle"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://horvvalle.com/#website",
                  "url": "https://horvvalle.com",
                  "name": "Horvvalle",
                  "publisher": { "@id": "https://horvvalle.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://horvvalle.com/collections?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "ClothingStore",
                  "@id": "https://horvvalle.com/#store",
                  "name": "Horvvalle Atelier",
                  "url": "https://horvvalle.com",
                  "priceRange": "₼₼",
                  "currenciesAccepted": "AZN",
                  "paymentAccepted": "Cash, Credit Card, Apple Pay, Google Pay",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Bakı",
                    "addressCountry": "AZ"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1517] font-sans antialiased selection:bg-[#E6C280] selection:text-black">
        <Analytics />
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <StoreDataProvider>
                <AuthProvider>
                  <StoreShell>
                    {children}
                  </StoreShell>
                </AuthProvider>
              </StoreDataProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
