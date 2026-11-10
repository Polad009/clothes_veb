"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/adminClient";
import { playOrderConfirmedChime } from "@/lib/soundEffects";
import { useToast } from "@/components/admin/ui";

export type Counts = { orders: number; pod: number; chat: number };

const EVERY_MS = 20_000;

function playNewOrderSound() {
  try {
    const audio = new Audio("/sounds/shopify-sale.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => playOrderConfirmedChime());
  } catch {
    playOrderConfirmedChime();
  }
}

/**
 * Runs on every admin page: keeps the navigation badges current and announces a new
 * order with a sound, a toast, the tab title and (if allowed) a desktop notification.
 */
export function AdminPulse({ onCounts }: { onCounts: (c: Counts) => void }) {
  const toast = useToast();
  const router = useRouter();
  const lastOrderId = useRef<string | null>(null);
  const baseTitle = useRef<string>("");

  useEffect(() => {
    let stopped = false;
    let unseen = 0;
    baseTitle.current = document.title.replace(/^\(\d+\) /, "");

    // Keeps checking while the tab is in the background, so a new order is still announced
    const check = async () => {
      try {
        const res = await fetch("/api/admin/pulse", { cache: "no-store" });
        if (!res.ok || stopped) return;
        const p = await res.json();
        onCounts({ orders: p.orders || 0, pod: p.pod || 0, chat: p.chat || 0 });

        const latest = p.latestOrder;
        if (lastOrderId.current === null) {
          lastOrderId.current = latest?.id || "";
          return;
        }
        if (latest && latest.id !== lastOrderId.current) {
          lastOrderId.current = latest.id;
          const text = `${latest.name} · ${formatMoney(latest.total, latest.currency)}${latest.isTest ? " (test)" : ""}`;
          playNewOrderSound();
          toast.success(`Yeni sifariş ${latest.id}: ${text}`);
          if (document.hidden) {
            unseen += 1;
            document.title = `(${unseen}) Yeni sifariş · İdarəetmə`;
          }
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const n = new Notification("Yeni sifariş — HORWALLE", { body: `${latest.id} · ${text}`, tag: latest.id });
            n.onclick = () => {
              window.focus();
              router.push(`/admin/orders/${encodeURIComponent(latest.id)}`);
            };
          }
          router.refresh();
        }
      } catch {
        /* the next check retries */
      }
    };

    const onVisible = () => {
      if (!document.hidden) {
        unseen = 0;
        if (/Yeni sifariş/.test(document.title)) document.title = baseTitle.current || "İdarəetmə";
      }
    };

    check();
    const timer = setInterval(check, EVERY_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onCounts, toast, router]);

  return null;
}
