"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminClient";
import { Plus, X } from "lucide-react";
import { Button, Card, Field, Input, PageHeader, Textarea, useToast } from "@/components/admin/ui";

type Banner = Record<string, string>;

interface ContentDraft {
  heroTag: string;
  announcements: string[];
  whatsappNumber: string;
  podBanner: Banner;
  promoBanner: Banner;
  campaignSecondary: Banner;
}

const SECTIONS: Array<{
  key: "podBanner" | "promoBanner" | "campaignSecondary";
  title: string;
  bodyField: "description" | "subtitle";
  hasImage: boolean;
}> = [
  { key: "podBanner", title: "Fərdi çap studiyası bloku", bodyField: "description", hasImage: true },
  { key: "promoBanner", title: "Şalvar kolleksiyası bloku", bodyField: "subtitle", hasImage: false },
  { key: "campaignSecondary", title: "Hudi kolleksiyası bloku", bodyField: "subtitle", hasImage: false },
];

export function ContentEditor({ initial }: { initial: ContentDraft }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<ContentDraft>(initial);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const setBanner = (key: (typeof SECTIONS)[number]["key"], field: string, value: string) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }));

  const save = async () => {
    for (const s of SECTIONS) {
      const link = (draft[s.key].ctaLink || "").trim();
      if (link && !/^(\/|https:\/\/)/.test(link)) {
        toast.error(`${s.title}: keçid "/" və ya "https://" ilə başlamalıdır.`);
        return;
      }
    }
    const phoneDigits = draft.whatsappNumber.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      toast.error("WhatsApp nömrəsini ölkə kodu ilə tam yazın. Məs: +994 10 328 31 52");
      return;
    }
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        body: {
          settings: { whatsappNumber: draft.whatsappNumber.trim() },
          content: {
            announcements: draft.announcements.map((a) => a.trim()).filter(Boolean),
            hero: { tag: draft.heroTag.trim() },
            podBanner: draft.podBanner,
            promoBanner: draft.promoBanner,
            campaignSecondary: draft.campaignSecondary,
          },
        },
      });
      toast.success("Yadda saxlanıldı. Dəyişiklik saytda dərhal görünür.");
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
        title="Sayt kontenti"
        description="Mətnlər saytın Azərbaycan dili versiyasında görünür; digər dillərin mətnləri hələ koddadır. WhatsApp nömrəsi bütün dillərdə dəyişir."
        actions={
          <Button variant="primary" disabled={!dirty} loading={saving} onClick={save}>
            Yadda saxla
          </Button>
        }
      />

      <div className="space-y-6">
        <Card title="Əlaqə">
          <div className="p-5">
            <Field
              label="WhatsApp dəstək nömrəsi"
              hint="Saytdakı bütün WhatsApp düymələri (çat, məhsul, ödəniş, izləmə, altlıq) bu nömrəyə yönəlir."
              className="max-w-sm"
            >
              <Input inputMode="tel" value={draft.whatsappNumber} onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })} placeholder="+994 10 328 31 52" />
            </Field>
          </div>
        </Card>

        <Card
          title="Elan zolağı"
          actions={
            <Button size="sm" onClick={() => setDraft({ ...draft, announcements: [...draft.announcements, ""] })}>
              <Plus className="h-4 w-4" /> Elan əlavə et
            </Button>
          }
        >
          <div className="space-y-2 p-5">
            <p className="text-xs text-stone-500">Saytın ən yuxarısında axan mətnlər. Siyahı boş qalsa, standart elanlar göstərilir.</p>
            {draft.announcements.map((text, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={text}
                  aria-label={`Elan ${i + 1}`}
                  onChange={(e) => setDraft({ ...draft, announcements: draft.announcements.map((a, ai) => (ai === i ? e.target.value : a)) })}
                  placeholder="Məs: BAKI VƏ SUMQAYITA ÇATDIRILMA PULSUZDUR"
                />
                <Button variant="ghost" aria-label={`Elan ${i + 1}-i sil`} onClick={() => setDraft({ ...draft, announcements: draft.announcements.filter((_, ai) => ai !== i) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Ana səhifə: nişan zolağı">
          <div className="p-5">
            <Field label="Birinci nişan mətni" hint="Ana səhifədə böyük şəklin üstündə fırlanan nişanların birincisi.">
              <Input value={draft.heroTag} onChange={(e) => setDraft({ ...draft, heroTag: e.target.value })} />
            </Field>
          </div>
        </Card>

        {SECTIONS.map((s) => {
          const b = draft[s.key];
          return (
            <Card key={s.key} title={s.title}>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Kiçik başlıq">
                  <Input value={b.tag || ""} onChange={(e) => setBanner(s.key, "tag", e.target.value)} />
                </Field>
                <Field label="Əsas başlıq">
                  <Input value={b.title || ""} onChange={(e) => setBanner(s.key, "title", e.target.value)} />
                </Field>
                <Field label="Mətn" className="sm:col-span-2">
                  <Textarea rows={3} value={b[s.bodyField] || ""} onChange={(e) => setBanner(s.key, s.bodyField, e.target.value)} />
                </Field>
                <Field label="Düymənin mətni">
                  <Input value={b.ctaText || ""} onChange={(e) => setBanner(s.key, "ctaText", e.target.value)} />
                </Field>
                <Field label="Düymənin keçidi" hint="Məs: /collections?category=hudi">
                  <Input value={b.ctaLink || ""} onChange={(e) => setBanner(s.key, "ctaLink", e.target.value)} />
                </Field>
                {s.hasImage && (
                  <Field label="Şəkil ünvanı (URL)" className="sm:col-span-2">
                    <Input value={b.image || ""} onChange={(e) => setBanner(s.key, "image", e.target.value)} placeholder="https://…" />
                  </Field>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
