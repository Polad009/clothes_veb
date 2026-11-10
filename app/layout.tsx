import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Ticker } from "@/components/Ticker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { StoreDataProvider } from "@/context/StoreDataContext";
import { TryOnProvider } from "@/context/TryOnContext";
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
    default: "Horwalle (Horvvalle) — Premium Geyim | Rəsmi Mağaza",
    template: "%s | Horwalle",
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
      { url: "/favicon.ico", sizes: "48x48 32x32 16x16", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  description: "Horwalle (Horvvalle) — premium geyim mağazası. Köynəklər, hudilər, şalvarlar və aksesuarlar; istəsən öz dizaynını 3D studiyada geyimə köçür. Bakıda sürətli çatdırılma.",
  keywords: [
    "Horwalle",
    "www.horwalle.com",
    "Horwalle geyim",
    "Horvvalle",
    "Horvvalle geyim",
    "Horwalle baku",
    "Lüks kişi köynəkləri",
    "3iplik premium hudi",
    "Chino şalvar",
    "Klassik geyim Bakı",
    "3D dizayn studiyası",
    "Online lüks geyim",
    "Azərbaycan geyim mağazası"
  ],
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "https://www.horwalle.com",
    siteName: "Horwalle",
    title: "Horwalle (Horvvalle) — Premium Geyim Mağazası",
    description: "Horwalle (Horvvalle) — premium geyim mağazası. Köynəklər, hudilər, şalvarlar və aksesuarlar; istəsən öz dizaynını 3D studiyada geyimə köçür. Bakıda sürətli çatdırılma.",
    images: [
      {
        url: "https://www.horwalle.com/images/categories/salvar-and-shortik-showcase.webp",
        width: 1200,
        height: 630,
        alt: "Horwalle Premium Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Horwalle (Horvvalle) — Premium Geyim Mağazası",
    description: "Horwalle (Horvvalle) — premium geyim mağazası. Köynəklər, hudilər, şalvarlar və aksesuarlar; istəsən öz dizaynını 3D studiyada geyimə köçür. Bakıda sürətli çatdırılma.",
    images: ["https://www.horwalle.com/images/categories/salvar-and-shortik-showcase.webp"],
  },
};

import { StoreShell } from "@/components/StoreShell";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import { Analytics } from "@/components/Analytics";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialStore = await getStoreSnapshot();

  return (
    <html lang="az">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Fraunces:opsz,wght@9..144,300..900&family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Fraunces:opsz,wght@9..144,300..900&family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
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
                  "description": "Premium geyim mağazası və 3D dizayn studiyası.",
                  "sameAs": [
                    "https://www.instagram.com/horwalle?vrfl=dGJ0anppbmYyeXRy&utm_source=qr",
                    "https://www.tiktok.com/@horwalle"
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
                  "name": "Horvvalle",
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
              <StoreDataProvider initial={initialStore}>
                <TryOnProvider>
                  <AuthProvider>
                    <StoreShell>
                      {children}
                    </StoreShell>
                  </AuthProvider>
                </TryOnProvider>
              </StoreDataProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
