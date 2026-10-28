"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Ticker } from "@/components/Ticker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/SmoothScroll";

import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname?.startsWith("/admin");

  // On admin routes, render ONLY the pure admin panel - zero ticker, zero header, zero footer
  if (isAdmin) {
    return (
      <main className="w-full min-h-screen bg-[#F8F9FA] flex flex-col p-0 m-0">
        {children}
      </main>
    );
  }

  return (
    <SmoothScroll>
      <Intro />
      <Suspense fallback={<div className="h-24 w-full bg-transparent" />}>
        <Ticker />
        <Header />
      </Suspense>
      <main id="main-content" className="flex-grow flex flex-col focus:outline-none">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </SmoothScroll>
  );
}
