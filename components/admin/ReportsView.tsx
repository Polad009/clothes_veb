"use client";

import React, { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/adminClient";
import { Button, Card, EmptyState, Field, Input, PageHeader, Select, Toggle } from "@/components/admin/ui";

export interface ReportRow {
  id: string;
  date: string;
  name: string;
  place: string;
  paymentMethod: string;
  cash: boolean;
  totalAzn: number;
  currency: string;
  paymentStatus: string;
  cancelled: boolean;
  isTest: boolean;
}

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const PERIODS = [
  { value: "year", label: "Bütün il", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { value: "q1", label: "I rüb (yanvar–mart)", months: [0, 1, 2] },
  { value: "q2", label: "II rüb (aprel–iyun)", months: [3, 4, 5] },
  { value: "q3", label: "III rüb (iyul–sentyabr)", months: [6, 7, 8] },
  { value: "q4", label: "IV rüb (oktyabr–dekabr)", months: [9, 10, 11] },
];

/** Year and month in Baku time (UTC+4), so late-evening orders land in the right month. */
function bakuParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + 4 * 3600 * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

const round = (n: number) => Math.round(n * 100) / 100;

export function ReportsView({ rows }: { rows: ReportRow[] }) {
  const years = useMemo(() => {
    const set = new Set(rows.map((r) => bakuParts(r.date).year));
    set.add(bakuParts(new Date().toISOString()).year);
    return Array.from(set).sort((a, b) => b - a);
  }, [rows]);

  const [year, setYear] = useState(years[0]);
  const [period, setPeriod] = useState("year");
  const [rate, setRate] = useState("2");
  const [includeTests, setIncludeTests] = useState(false);

  const months = PERIODS.find((p) => p.value === period)!.months;
  const ratePct = Math.max(0, Number(rate.replace(",", ".")) || 0);

  const ledger = useMemo(
    () =>
      rows
        .filter((r) => {
          if (r.cancelled) return false;
          if (r.isTest ? !includeTests || r.paymentStatus !== "test_paid" : r.paymentStatus !== "paid") return false;
          const { year: y, month } = bakuParts(r.date);
          return y === year && months.includes(month);
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
    [rows, year, months, includeTests]
  );

  const monthly = months.map((m) => {
    const inMonth = ledger.filter((r) => bakuParts(r.date).month === m);
    const card = round(inMonth.filter((r) => !r.cash).reduce((s, r) => s + r.totalAzn, 0));
    const cash = round(inMonth.filter((r) => r.cash).reduce((s, r) => s + r.totalAzn, 0));
    return { month: m, orders: inMonth.length, card, cash, total: round(card + cash), tax: round(((card + cash) * ratePct) / 100) };
  });
  const totals = monthly.reduce(
    (t, m) => ({ orders: t.orders + m.orders, card: t.card + m.card, cash: t.cash + m.cash, total: t.total + m.total, tax: t.tax + m.tax }),
    { orders: 0, card: 0, cash: 0, total: 0, tax: 0 }
  );
  const periodLabel = `${year} · ${PERIODS.find((p) => p.value === period)!.label}`;

  const exportCsv = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      ["Sifariş", "Tarix", "Müştəri", "Ünvan", "Ödəniş üsulu", "Məbləğ (AZN)", `Vergi ${ratePct}% (AZN)`].map(esc).join(";"),
      ...ledger.map((r) =>
        [r.id, formatDate(r.date), r.name, r.place, r.paymentMethod, r.totalAzn.toFixed(2), round((r.totalAzn * ratePct) / 100).toFixed(2)]
          .map(esc)
          .join(";")
      ),
      ["Cəmi", "", "", "", "", round(totals.total).toFixed(2), round(totals.tax).toFixed(2)].map(esc).join(";"),
    ];
    // BOM so Excel opens the Azerbaijani letters correctly
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `horwalle-hesabat-${year}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Satış və vergi hesabatı"
          description="Yalnız ödənilmiş, ləğv edilməmiş sifarişlər. USD sifarişləri 1.70 məzənnə ilə manata çevrilir."
          actions={
            <>
              <Button onClick={exportCsv} disabled={ledger.length === 0}>
                <Download className="h-4 w-4" /> Excel (CSV)
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Çap et
              </Button>
            </>
          }
        />

        <Card className="mb-6">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="İl">
              <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </Field>
            <Field label="Dövr">
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Vergi dərəcəsi (%)" hint="Dərəcəni mühasibinizlə dəqiqləşdirin.">
              <Input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <div className="flex w-full items-center justify-between rounded-lg border border-stone-200 px-4 py-2.5">
                <span className="text-sm text-stone-700">Test sifarişlərini daxil et</span>
                <Toggle checked={includeTests} onChange={setIncludeTests} label="Test sifarişlərini daxil et" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="hidden print:mb-6 print:block">
        <p className="text-lg font-semibold">Horwalle — satış və vergi hesabatı</p>
        <p className="text-sm">{periodLabel} · vergi dərəcəsi {ratePct}% · hazırlanıb: {formatDate(new Date().toISOString())}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Cəmi dövriyyə", formatMoney(totals.total)],
          ["Kart ilə", formatMoney(totals.card)],
          ["Sifariş sayı", String(totals.orders)],
          [`Vergi (${ratePct}%)`, formatMoney(totals.tax)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-[13px] text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      <Card title={`Aylar üzrə · ${periodLabel}`} className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm tabular-nums">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                <th className="px-5 py-2.5 font-medium">Ay</th>
                <th className="px-3 py-2.5 text-right font-medium">Sifariş</th>
                <th className="px-3 py-2.5 text-right font-medium">Kart</th>
                <th className="px-3 py-2.5 text-right font-medium">Nağd</th>
                <th className="px-3 py-2.5 text-right font-medium">Cəmi</th>
                <th className="px-5 py-2.5 text-right font-medium">Vergi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {monthly.map((m) => (
                <tr key={m.month}>
                  <td className="px-5 py-2.5">{MONTHS[m.month]}</td>
                  <td className="px-3 py-2.5 text-right">{m.orders}</td>
                  <td className="px-3 py-2.5 text-right">{formatMoney(m.card)}</td>
                  <td className="px-3 py-2.5 text-right">{formatMoney(m.cash)}</td>
                  <td className="px-3 py-2.5 text-right font-medium">{formatMoney(m.total)}</td>
                  <td className="px-5 py-2.5 text-right">{formatMoney(m.tax)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-stone-300 font-semibold">
                <td className="px-5 py-2.5">Cəmi</td>
                <td className="px-3 py-2.5 text-right">{totals.orders}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totals.card)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totals.cash)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totals.total)}</td>
                <td className="px-5 py-2.5 text-right">{formatMoney(totals.tax)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card title={`Sifarişlərin reyestri · ${ledger.length} qeyd`}>
        {ledger.length === 0 ? (
          <EmptyState title="Bu dövrdə ödənilmiş sifariş yoxdur" description="İli, dövrü dəyişin və ya test sifarişlərini daxil edin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-5 py-2.5 font-medium">Sifariş</th>
                  <th className="px-3 py-2.5 font-medium">Tarix</th>
                  <th className="px-3 py-2.5 font-medium">Müştəri</th>
                  <th className="px-3 py-2.5 font-medium">Ödəniş</th>
                  <th className="px-5 py-2.5 text-right font-medium">Məbləğ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ledger.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-2.5 font-medium">{r.id}{r.isTest ? " (test)" : ""}</td>
                    <td className="px-3 py-2.5 text-stone-600">{formatDate(r.date)}</td>
                    <td className="px-3 py-2.5">
                      {r.name}
                      {r.place && <span className="block text-xs text-stone-500">{r.place}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-stone-600">{r.paymentMethod}</td>
                    <td className="px-5 py-2.5 text-right font-medium tabular-nums">
                      {formatMoney(r.totalAzn)}
                      {r.currency === "USD" && <span className="block text-xs font-normal text-stone-500">USD sifarişi</span>}
                    </td>
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
