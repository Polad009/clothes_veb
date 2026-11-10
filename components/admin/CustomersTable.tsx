"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Customer } from "@/lib/db/stats";
import { formatDate, formatMoney } from "@/lib/adminClient";
import { Card, EmptyState, Input, PageHeader } from "@/components/admin/ui";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits))
    );
  }, [customers, query]);

  return (
    <>
      <PageHeader title="Müştərilər" description={`${customers.length} qeydiyyatlı hesab. Xərc yalnız ödənilmiş real sifarişlərdən hesablanır.`} />
      <Card>
        <div className="border-b border-stone-200 p-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad, e-poçt və ya telefon" aria-label="Müştərilərdə axtar" className="pl-9" />
          </div>
        </div>
        {visible.length === 0 ? (
          <EmptyState title={customers.length === 0 ? "Hələ qeydiyyatlı müştəri yoxdur" : "Uyğun müştəri tapılmadı"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-5 py-2.5 font-medium">Müştəri</th>
                  <th className="px-3 py-2.5 font-medium">Əlaqə</th>
                  <th className="px-3 py-2.5 font-medium">Qeydiyyat</th>
                  <th className="px-3 py-2.5 text-right font-medium">Sifariş</th>
                  <th className="px-5 py-2.5 text-right font-medium">Xərc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-stone-900">{c.name || "Adsız hesab"}</p>
                      <p className="mt-0.5 text-xs text-stone-500">{[c.city, c.address].filter(Boolean).join(" · ") || "Ünvan yoxdur"}</p>
                    </td>
                    <td className="px-3 py-3">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="block text-stone-700 underline-offset-2 hover:underline">{c.email}</a>
                      )}
                      {c.phone && <span className="mt-0.5 block text-xs text-stone-500">{c.phone}</span>}
                    </td>
                    <td className="px-3 py-3 text-stone-600">{formatDate(c.createdAt, false)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {c.orders}
                      {c.lastOrderAt && <span className="block text-xs text-stone-500">son: {formatDate(c.lastOrderAt, false)}</span>}
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{formatMoney(c.spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
