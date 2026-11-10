"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  Palette,
  TicketPercent,
  Users,
  MessageCircle,
  FileText,
  Mail,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/admin/ui";

const NAV: Array<{ heading: string; items: Array<{ href: string; label: string; icon: React.ElementType; badgeKey?: "orders" | "pod" | "chat" }> }> = [
  {
    heading: "Mağaza",
    items: [
      { href: "/admin", label: "İcmal", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Sifarişlər", icon: ShoppingBag, badgeKey: "orders" },
      { href: "/admin/pod", label: "Fərdi çap", icon: Palette, badgeKey: "pod" },
      { href: "/admin/products", label: "Məhsullar", icon: Shirt },
      { href: "/admin/promos", label: "Promokodlar", icon: TicketPercent },
      { href: "/admin/reports", label: "Hesabatlar", icon: BarChart3 },
    ],
  },
  {
    heading: "Müştərilər",
    items: [
      { href: "/admin/customers", label: "Müştərilər", icon: Users },
      { href: "/admin/live-chat", label: "Canlı çat", icon: MessageCircle, badgeKey: "chat" },
      { href: "/admin/campaigns", label: "E-poçt kampaniyası", icon: Mail },
    ],
  },
  {
    heading: "Sayt",
    items: [
      { href: "/admin/content", label: "Sayt kontenti", icon: FileText },
      { href: "/admin/settings", label: "Tənzimləmələr", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({ counts, children }: { counts: { orders: number; pod: number; chat: number }; children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  };

  const sidebar = (
    <nav className="flex h-full flex-col bg-[#1A1517] text-stone-300" aria-label="Admin menyusu">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/admin" className="text-[15px] font-semibold tracking-[0.18em] text-white">
          HORWALLE
        </Link>
        <button type="button" className="rounded-md p-1 text-stone-400 hover:text-white lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Menyunu bağla">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.heading} className="mt-5 first:mt-2">
            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">{group.heading}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = item.badgeKey ? counts[item.badgeKey] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active ? "bg-white/10 font-medium text-white" : "hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-[#E6C280]" : "text-stone-500")} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-[#E6C280] px-1.5 py-px text-[11px] font-semibold text-stone-900">{count}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-0.5 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px] text-stone-500" aria-hidden />
          Sayta bax
        </a>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-white/5 hover:text-white">
          <LogOut className="h-[18px] w-[18px] text-stone-500" aria-hidden />
          Çıxış
        </button>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-stone-50 text-stone-900 print:bg-white">
        {/* Desktop sidebar */}
        <div className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block print:!hidden">{sidebar}</div>

        {/* Mobile top bar + drawer */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4 lg:hidden print:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Menyunu aç" className="rounded-md p-1.5 text-stone-700 hover:bg-stone-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold tracking-[0.18em]">HORWALLE</span>
        </header>
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-stone-900/50" onClick={() => setMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 shadow-xl">{sidebar}</div>
          </div>
        )}

        <div className="lg:pl-60 print:!pl-0">{children}</div>
      </div>
    </ToastProvider>
  );
}

/** Standard padded page container. Full-bleed pages (chat, legacy) skip it. */
export function AdminPage({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8", narrow ? "max-w-4xl" : "max-w-7xl")}>{children}</div>;
}
