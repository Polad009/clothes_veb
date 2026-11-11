import type { Metadata, Viewport } from "next";
import React from "react";
import { Archivo, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Self-hosted by Next (no request to Google at page load); exposed as CSS variables
const archivo = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext", "cyrillic-ext"], variable: "--font-jakarta", display: "swap", preload: false });
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { StoreDataProvider } from "@/context/StoreDataContext";
import { TryOnProvider } from "@/context/TryOnContext";
import { AuthProvider } from "@/context/AuthContext";



export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.horwalle.com"),
  applicationName: "Horwalle",
  title: {
    default: "Horwalle — Premium Geyim Mağazası",
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
  description: "Horwalle — premium geyim mağazası. Köynəklər, hudilər, şalvarlar və aksesuarlar; öz dizaynını 3D studiyada geyimə köçür. Azərbaycana və dünyanın hər yerinə çatdırılma.",
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
    title: "Horwalle — Premium Geyim Mağazası",
    description: "Horwalle — premium geyim mağazası. Köynəklər, hudilər, şalvarlar və aksesuarlar; öz dizaynını 3D studiyada geyimə köçür. Azərbaycana və dünyanın hər yerinə çatdırılma.",
    images: [
      {
        url: "https://www.horwalle.com/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Horwalle Premium Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Horwalle — Premium Geyim Mağazası",
    description: "Horwalle — premium geyim mağazası. Köynəklər, hudilər, şalvarlar və aksesuarlar; öz dizaynını 3D studiyada geyimə köçür. Azərbaycana və dünyanın hər yerinə çatdırılma.",
    images: ["https://www.horwalle.com/brand/og-image.jpg"],
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
    <html lang="az" className={`${archivo.variable} ${jakarta.variable}`}>
      <head>
        {/* Google Search Rich Snippets & Knowledge Graph Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.horwalle.com/#organization",
                  "name": "Horwalle",
                  "alternateName": "Horvvalle",
                  "url": "https://www.horwalle.com",
                  "logo": "https://www.horwalle.com/icon.png",
                  "description": "Premium geyim mağazası və 3D dizayn studiyası.",
                  "sameAs": [
                    "https://www.instagram.com/horwalle?vrfl=dGJ0anppbmYyeXRy&utm_source=qr",
                    "https://www.tiktok.com/@horwalle"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.horwalle.com/#website",
                  "url": "https://www.horwalle.com",
                  "name": "Horwalle",
                  "alternateName": ["Horvvalle", "horwalle.com"],
                  "publisher": { "@id": "https://www.horwalle.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.horwalle.com/collections?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "ClothingStore",
                  "@id": "https://www.horwalle.com/#store",
                  "name": "Horwalle",
                  "url": "https://www.horwalle.com",
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
      <body className="min-h-screen flex flex-col bg-ink text-[#1A1517] font-sans antialiased selection:bg-bone selection:text-ink">
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
