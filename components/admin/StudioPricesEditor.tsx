"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminClient";
import { Badge, Button, Card, Field, Input, PageHeader, Toggle, useToast } from "@/components/admin/ui";
import {
  EXTRA_SPOT_PRICE,
  STUDIO_MARKUP,
  STUDIO_PRODUCTS,
  UNPRICED_DEFAULTS,
  type PrintType,
  type StudioPriceSettings,
} from "@/lib/studio/catalog";

const TYPES: Array<{ key: PrintType; label: string }> = [
  { key: "small", label: "Kiçik çap (10 sm)" },
  { key: "one", label: "Tək tərəf" },
  { key: "two", label: "İki tərəf" },
];

type Row = { active: boolean } & Record<PrintType, string>;

const toText = (v: number | null | undefined) => (typeof v === "number" ? String(v) : "");
const parse = (v: string): number | null | "bad" => {
  const t = v.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n < 10000 ? Math.round(n * 100) / 100 : "bad";
};

/** Prices of "Öz dizaynını yarat": price-list price per print type, plus the store's markup. */
export function StudioPricesEditor({ initial }: { initial: StudioPriceSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [markup, setMarkup] = useState(toText(initial.markup ?? STUDIO_MARKUP));
  const [extra, setExtra] = useState(toText(initial.extra ?? EXTRA_SPOT_PRICE));
  const [rows, setRows] = useState<Record<string, Row>>(() =>
    Object.fromEntries(
      STUDIO_PRODUCTS.map((p) => {
        const o = initial.items?.[p.id];
        const pick = (t: PrintType) => (o && t in o ? toText(o[t]) : toText(p.list[t]));
        return [p.id, { active: o?.active !== false, small: pick("small"), one: pick("one"), two: pick("two") }];
      })
    )
  );
  const [saving, setSaving] = useState(false);

  const m = parse(markup);
  const ex = parse(extra);
  const sell = (v: string) => {
    const n = parse(v);
    return typeof n === "number" && typeof m === "number" ? `${(n + m).toFixed(2)} ₼` : "—";
  };
  const set = (id: string, patch: Partial<Row>) => setRows((all) => ({ ...all, [id]: { ...all[id], ...patch } }));
  const visible = useMemo(() => Object.values(rows).filter((r) => r.active).length, [rows]);

  const save = async () => {
    if (typeof m !== "number" || typeof ex !== "number") {
      toast.error("Əlavə məbləğ və əlavə yer qiyməti düzgün rəqəm olmalıdır.");
      return;
    }
    const items: NonNullable<StudioPriceSettings["items"]> = {};
    for (const p of STUDIO_PRODUCTS) {
      const r = rows[p.id];
      const entry: Record<string, number | null | boolean> = { active: r.active };
      let any = false;
      for (const t of TYPES) {
        const n = parse(r[t.key]);
        if (n === "bad") {
          toast.error(`${p.name}: "${t.label}" qiyməti düzgün deyil.`);
          return;
        }
        entry[t.key] = n;
        if (n !== null) any = true;
      }
      if (r.active && !any) {
        toast.error(`${p.name}: ən azı bir çap qiyməti yazın və ya məhsulu gizlədin.`);
        return;
      }
      items[p.id] = entry as any;
    }
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", { body: { settings: { studioPrices: { markup: m, extra: ex, items } } } });
      toast.success("Studio qiymətləri yadda saxlanıldı. Saytda bir dəqiqə ərzində görünür.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const restore = () => {
    setMarkup(String(STUDIO_MARKUP));
    setExtra(String(EXTRA_SPOT_PRICE));
    setRows(Object.fromEntries(STUDIO_PRODUCTS.map((p) => [p.id, { active: true, small: toText(p.list.small), one: toText(p.list.one), two: toText(p.list.two) }])));
    toast.success("Cədvəldəki standart qiymətlər yazıldı. Yadda saxlamağı unutmayın.");
  };

  return (
    <>
      <PageHeader
        title="Studio qiymətləri"
        description="“Öz dizaynını yarat” bölməsinin qiymətləri. Cədvəldəki çap qiymətini yazın; saytdakı qiymət = bu qiymət + əlavə məbləğ."
        actions={
          <div className="flex gap-2">
            <Button onClick={restore}>Standart qiymətlər</Button>
            <Button variant="primary" loading={saving} onClick={save}>
              Yadda saxla
            </Button>
          </div>
        }
      />

      <Card title="Ümumi">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Hər məhsulun üstünə əlavə (₼)" hint="Cədvəldəki qiymətin üstünə gəlir. İndi: 10 ₼.">
            <Input inputMode="decimal" value={markup} onChange={(e) => setMarkup(e.target.value)} />
          </Field>
          <Field label="Əlavə yer (qol / boyun / yan) (₼)" hint="Hər əlavə çap yeri üçün. Əlavə məbləğ buna gəlmir.">
            <Input inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} />
          </Field>
        </div>
      </Card>

      <div className="mt-6">
        <Card title={`Məhsullar · saytda ${visible} / ${STUDIO_PRODUCTS.length}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-4 py-3 font-medium">Məhsul</th>
                  {TYPES.map((t) => (
                    <th key={t.key} className="px-2 py-3 font-medium">
                      {t.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Saytda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {STUDIO_PRODUCTS.map((p) => {
                  const r = rows[p.id];
                  return (
                    <tr key={p.id} className={r.active ? "" : "opacity-50"}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{p.name}</div>
                        {UNPRICED_DEFAULTS.includes(p.id) && (
                          <div className="mt-1">
                            <Badge tone="amber">cədvəldə yox idi, qiyməti yoxlayın</Badge>
                          </div>
                        )}
                      </td>
                      {TYPES.map((t) => (
                        <td key={t.key} className="px-2 py-3 align-top">
                          <Input
                            inputMode="decimal"
                            value={r[t.key]}
                            placeholder="—"
                            onChange={(e) => set(p.id, { [t.key]: e.target.value } as Partial<Row>)}
                            className="w-24"
                            aria-label={`${p.name} — ${t.label}`}
                          />
                          <div className="mt-1 text-[11px] text-stone-500">saytda: {sell(r[t.key])}</div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right align-top">
                        <Toggle checked={r.active} onChange={(v) => set(p.id, { active: v })} label={`${p.name} saytda`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-stone-100 px-4 py-3 text-xs text-stone-500">
            Boş xana = həmin çap növü bu məhsul üçün təklif olunmur. Sifariş zamanı qiymət serverdə bu cədvələ görə yenidən hesablanır.
          </p>
        </Card>
      </div>
    </>
  );
}
