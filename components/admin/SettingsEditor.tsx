"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShippingRates } from "@/lib/shipping";
import { adminFetch } from "@/lib/adminClient";
import { Button, Card, Field, Input, PageHeader, Textarea, useToast } from "@/components/admin/ui";
import { EmailDomainCard } from "@/components/admin/EmailDomainCard";
import { AdminCredentialsCard } from "@/components/admin/AdminCredentialsCard";

type RateKey = keyof ShippingRates;

const RATE_ROWS: Array<{ title: string; hint: string; azn: RateKey; usd: RateKey }> = [
  { title: "Rayonlar / Azərpoçt", hint: "Bakı və Sumqayıt həmişə pulsuzdur.", azn: "regionAZN", usd: "regionUSD" },
  { title: "Rayonlar: bu məbləğdən pulsuz", hint: "Səbət bu məbləğə çatanda rayon çatdırılması pulsuz olur. 0 = həmişə pulsuz.", azn: "regionFreeFromAZN", usd: "regionFreeFromUSD" },
  { title: "Xaricə: standart poçt", hint: "Sabit tarif.", azn: "intlStandardAZN", usd: "intlStandardUSD" },
  { title: "Xaricə: DHL Express", hint: "Böyük sifarişlərdə avtomatik endirim qalır (340 ₼ / $200-dən).", azn: "intlExpressAZN", usd: "intlExpressUSD" },
];

export function SettingsEditor({ shipping, privacy, terms, markup }: { shipping: ShippingRates; privacy: string; terms: string; markup: number }) {
  const router = useRouter();
  const toast = useToast();
  const [rates, setRates] = useState<Record<RateKey, string>>(
    () => Object.fromEntries(Object.entries(shipping).map(([k, v]) => [k, String(v)])) as Record<RateKey, string>
  );
  const [privacyText, setPrivacyText] = useState(privacy);
  const [termsText, setTermsText] = useState(terms);
  const [saving, setSaving] = useState(false);
  const [markupText, setMarkupText] = useState(String(markup));
  const markupValue = Number(markupText.replace(",", "."));
  const example = 40;
  const exampleForeign = Number.isFinite(markupValue) ? Math.round(example * (1 + markupValue / 100) * 100) / 100 : example;

  const save = async () => {
    const parsed: Partial<ShippingRates> = {};
    for (const [key, raw] of Object.entries(rates) as Array<[RateKey, string]>) {
      const value = Number(raw.replace(",", "."));
      if (raw.trim() === "" || !Number.isFinite(value) || value < 0 || value > 10000) {
        toast.error("Çatdırılma qiymətləri 0 və ya müsbət rəqəm olmalıdır.");
        return;
      }
      parsed[key] = Math.round(value * 100) / 100;
    }
    if (markupText.trim() === "" || !Number.isFinite(markupValue) || markupValue < 0 || markupValue > 300) {
      toast.error("Xarici qiymət fərqi 0 ilə 300 arasında faiz olmalıdır.");
      return;
    }
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        body: {
          settings: { shipping: parsed, regionPricing: { foreignMarkupPercent: Math.round(markupValue * 10) / 10 } },
          content: { policies: { privacy: privacyText.trim(), terms: termsText.trim() } },
        },
      });
      toast.success("Tənzimləmələr yadda saxlanıldı və saytda qüvvədədir.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tənzimləmələr"
        description="Qiymət və çatdırılma dəyişiklikləri həm saytda, həm də serverdəki ödəniş yoxlamasında eyni anda qüvvəyə minir."
        actions={
          <Button variant="primary" loading={saving} onClick={save}>
            Yadda saxla
          </Button>
        }
      />

      <div className="space-y-6">
        <Card title="Ölkəyə görə qiymət">
          <div className="space-y-4 p-5">
            <p className="text-sm text-stone-600">
              Azərbaycandan girənlər məhsulun manat qiymətini görür. Başqa ölkədən girənlər daha yüksək <strong>xarici qiyməti</strong> görür:
              məhsulda "Xarici qiymət ($)" yazılıbsa o, yazılmayıbsa manat qiyməti + aşağıdakı faiz. Ödənişdə qiymət çatdırılma ölkəsinə görə hesablanır.
            </p>
            <div className="grid gap-4 sm:grid-cols-[12rem_1fr] sm:items-end">
              <Field label="Xarici qiymət fərqi (%)" hint="0 yazsanız, hamı eyni qiyməti görər.">
                <Input inputMode="decimal" value={markupText} onChange={(e) => setMarkupText(e.target.value)} />
              </Field>
              <p className="rounded-lg bg-stone-50 px-3 py-2.5 text-sm text-stone-700">
                Nümunə: {example.toFixed(2)} ₼ olan məhsul xaricdə <strong>{exampleForeign.toFixed(2)} ₼</strong> (≈ ${(exampleForeign / 1.7).toFixed(2)}) olur.
              </p>
            </div>
          </div>
        </Card>

        <AdminCredentialsCard />

        <EmailDomainCard />

        <Card title="Çatdırılma qiymətləri">
          <div className="divide-y divide-stone-100">
            {RATE_ROWS.map((row) => (
              <div key={row.azn} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_8rem_8rem] sm:items-end">
                <div>
                  <p className="text-sm font-medium text-stone-900">{row.title}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{row.hint}</p>
                </div>
                <Field label="₼">
                  <Input inputMode="decimal" value={rates[row.azn]} onChange={(e) => setRates({ ...rates, [row.azn]: e.target.value })} />
                </Field>
                <Field label="$">
                  <Input inputMode="decimal" value={rates[row.usd]} onChange={(e) => setRates({ ...rates, [row.usd]: e.target.value })} />
                </Field>
              </div>
            ))}
          </div>
        </Card>

        {[
          { title: "Məxfilik siyasəti", value: privacyText, set: setPrivacyText, href: "/privacy" },
          { title: "İstifadə şərtləri", value: termsText, set: setTermsText, href: "/terms" },
        ].map((page) => (
          <Card
            key={page.href}
            title={page.title}
            actions={
              <a href={page.href} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-stone-600 hover:text-stone-900">
                Saytda bax
              </a>
            }
          >
            <div className="space-y-2 p-5">
              <p className="text-xs text-stone-500">
                Boş qalsa saytdakı hazır mətn göstərilir. Başlıq üçün sətri <code className="font-mono">## </code> ilə başladın; abzasları boş sətirlə ayırın.
              </p>
              <Textarea rows={12} value={page.value} onChange={(e) => page.set(e.target.value)} placeholder={"## 1. Ümumi müddəalar\nMətn…"} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
