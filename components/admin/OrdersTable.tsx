"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Search } from "lucide-react";
import { adminFetch, formatDate, formatMoney, ORDER_STATUSES, orderStatusTone, paymentLabel } from "@/lib/adminClient";
import { Badge, Card, ConfirmButton, EmptyState, Input, PageHeader, Select, useToast } from "@/components/admin/ui";

export interface OrderRow {
  id: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  items: number;
  hasCustom: boolean;
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  isTest: boolean;
  trackingCode: string;
}

export function OrdersTable({ orders, initialStatus, isOwner = true }: { orders: OrderRow[]; initialStatus: string; isOwner?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [kind, setKind] = useState<"real" | "test" | "all">("all");

  const testCount = useMemo(() => orders.filter((o) => o.isTest).length, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return orders.filter((o) => {
      if (kind === "real" && o.isTest) return false;
      if (kind === "test" && !o.isTest) return false;
      if (status !== "all" && o.orderStatus !== status) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.trackingCode.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (digits.length >= 3 && o.phone.replace(/\D/g, "").includes(digits))
      );
    });
  }, [orders, query, status, kind]);

  // A barcode scanner types the order number and presses Enter.
  const openExact = () => {
    const code = query.trim().toUpperCase();
    const hit = orders.find((o) => o.id.toUpperCase() === code || o.trackingCode.toUpperCase() === code);
    if (hit) router.push(`/admin/orders/${encodeURIComponent(hit.id)}`);
    else if (visible.length === 1) router.push(`/admin/orders/${encodeURIComponent(visible[0].id)}`);
  };

  const clearTests = async () => {
    try {
      const res = await adminFetch<{ count: number }>("/api/admin/orders/clear-test", { method: "DELETE" });
      toast.success(`${res.count} test sifarişi silindi.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Sifarişlər"
        description={`${orders.length - testCount} real sifariş${testCount ? ` · ${testCount} test` : ""}`}
        actions={
          isOwner ? (
            <>
              {orders.length > 0 && (
                <a
                  href="/api/admin/orders-export"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
                >
                  <Download className="h-4 w-4" aria-hidden /> Excel-ə yüklə
                </a>
              )}
              {testCount > 0 && (
                <ConfirmButton size="md" onConfirm={clearTests} confirmLabel={`${testCount} test sifarişini sil`}>Test sifarişlərini təmizlə</ConfirmButton>
              )}
            </>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2 border-b border-stone-200 p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  openExact();
                }
              }}
              autoFocus
              placeholder="Sifariş nömrəsi, ad, telefon, e-poçt — və ya barkodu skan edin"
              aria-label="Sifarişlərdə axtar"
              className="pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status üzrə süz" className="w-auto">
            <option value="all">Bütün statuslar</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Sifariş növü" className="w-auto">
            <option value="all">Real və test</option>
            <option value="real">Yalnız real</option>
            <option value="test">Yalnız test</option>
          </Select>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title={orders.length === 0 ? "Hələ sifariş yoxdur" : "Uyğun sifariş tapılmadı"}
            description={orders.length === 0 ? "İlk sifariş gələn kimi burada görünəcək." : "Axtarışı və ya süzgəcləri dəyişin."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs font-medium text-stone-500">
                  <th className="px-5 py-2.5 font-medium">Sifariş</th>
                  <th className="px-3 py-2.5 font-medium">Müştəri</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Ödəniş</th>
                  <th className="px-5 py-2.5 text-right font-medium">Məbləğ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((o) => {
                  const pay = paymentLabel(o.paymentStatus);
                  return (
                    <tr key={o.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${encodeURIComponent(o.id)}`} className="font-medium text-stone-900 underline-offset-2 hover:underline">
                          {o.id}
                        </Link>
                        {o.isTest && <span className="ml-2"><Badge tone="violet">Test</Badge></span>}
                        <p className="mt-0.5 text-xs text-stone-500">
                          {formatDate(o.date)} · {o.items} məhsul{o.hasCustom ? " · öz dizayn" : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-stone-900">{o.name}</p>
                        <p className="mt-0.5 text-xs text-stone-500">{o.phone}{o.city ? ` · ${o.city}` : ""}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={orderStatusTone(o.orderStatus)}>{o.orderStatus}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={pay.tone}>{pay.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">{formatMoney(o.total, o.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
