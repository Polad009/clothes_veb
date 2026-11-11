"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartPanel } from "@/components/store/CartPanel";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { AuthModal } from "@/components/AuthModal";
import { CookieConsent } from "@/components/CookieConsent";
import { DocumentTitle } from "@/components/store/DocumentTitle";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname?.startsWith("/admin");

  // Admin routes render only the panel: no storefront header or footer
  if (isAdmin) {
    return <main className="m-0 flex min-h-screen w-full flex-col bg-[#F8F9FA] p-0">{children}</main>;
  }

  // Pages built for the old light design get the dark colour mapping from globals.css (.hw-dark)
  const p = pathname || "/";
  const redesigned = p === "/" || p.startsWith("/collections") || p.startsWith("/products/") || p.startsWith("/studio") || p.startsWith("/checkout") || p === "/terms" || p === "/privacy";

  return (
    <>
      <Suspense fallback={<div className="h-[100px] w-full bg-ink" />}>
        <StoreHeader />
      </Suspense>
      <main id="main-content" className={`flex flex-grow flex-col focus:outline-none ${redesigned ? "" : "hw-dark"}`}>
        {children}
      </main>
      <StoreFooter />
      <CartPanel />
      <FloatingWhatsApp />
      {/* these overlays still use the old light classes: give them the dark mapping */}
      <div className="hw-dark contents">
        <AuthModal />
      </div>
      <CookieConsent />
      <DocumentTitle />
    </>
  );
}
