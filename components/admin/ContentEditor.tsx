"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { LANG_LABEL, LANGS, type Lang } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Button, Card, Field, Input, PageHeader, Textarea, useToast } from "@/components/admin/ui";

type Banner = Record<string, string>;
type SectionKey = "podBanner" | "promoBanner" | "campaignSecondary";

/** Texts in one language. Links and images are shared by all languages. */
interface LangTexts {
  announcements: string[];
  hero: { tag?: string };
  podBanner: Banner;
  promoBanner: Banner;
  campaignSecondary: Banner;
}

interface ContentDraft {
  heroTag: string;
  announcements: string[];
  whatsappNumber: string;
  podBanner: Banner;
  promoBanner: Banner;
  campaignSecondary: Banner;
  i18n?: Partial<Record<Lang, Partial<LangTexts>>>;
}

const SECTIONS: Array<{ key: SectionKey; title: string; bodyField: "description" | "subtitle"; hasImage: boolean }> = [
  { key: "podBanner", title: "Dizayn studiyası bloku", bodyField: "description", hasImage: true },
  { key: "promoBanner", title: "Şalvar kolleksiyası bloku", bodyField: "subtitle", hasImage: false },
  { key: "campaignSecondary", title: "Hudi kolleksiyası bloku", bodyField: "subtitle", hasImage: false },
];
const TEXT_FIELDS = ["tag", "title", "description", "subtitle", "ctaText"];

const emptyTexts = (): LangTexts => ({ announcements: [], hero: {}, podBanner: {}, promoBanner: {}, campaignSecondary: {} });

export function ContentEditor({ initial }: { initial: ContentDraft }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<ContentDraft>(initial);
  const [i18n, setI18n] = useState<Record<Exclude<Lang, "az">, LangTexts>>(() => ({
    en: { ...emptyTexts(), ...(initial.i18n?.en || {}) } as LangTexts,
    ru: { ...emptyTexts(), ...(initial.i18n?.ru || {}) } as LangTexts,
    tr: { ...emptyTexts(), ...(initial.i18n?.tr || {}) } as LangTexts,
  }));
  const [lang, setLang] = useState<Lang>("az");
  const [saving, setSaving] = useState(false);

  const isAz = lang === "az";
  const other = isAz ? null : i18n[lang as Exclude<Lang, "az">];

  // Read/write helpers that target the language being edited
  const announcements = isAz ? draft.announcements : other!.announcements;
  const setAnnouncements = (list: string[]) =>
    isAz ? setDraft({ ...draft, announcements: list }) : setI18n({ ...i18n, [lang]: { ...other!, announcements: list } });
  const heroTag = isAz ? draft.heroTag : other!.hero.tag || "";
  const setHeroTag = (v: string) =>
    isAz ? setDraft({ ...draft, heroTag: v }) : setI18n({ ...i18n, [lang]: { ...other!, hero: { ...other!.hero, tag: v } } });
  const banner = (key: SectionKey): Banner => (isAz ? draft[key] : other![key]);
  const setBanner = (key: SectionKey, field: string, value: string) =>
    isAz
      ? setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }))
      : setI18n((all) => ({ ...all, [lang]: { ...all[lang as Exclude<Lang, "az">], [key]: { ...all[lang as Exclude<Lang, "az">][key], [field]: value } } }));

  const translatedCount = (l: Exclude<Lang, "az">) => {
    const t = i18n[l];
    return t.announcements.filter(Boolean).length + (t.hero.tag ? 1 : 0) + SECTIONS.reduce((n, s) => n + TEXT_FIELDS.filter((f) => t[s.key]?.[f]).length, 0);
  };

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

    // Keep only filled-in translations
    const cleanI18n: Record<string, Partial<LangTexts>> = {};
    for (const l of ["en", "ru", "tr"] as const) {
      const t = i18n[l];
      const entry: Partial<LangTexts> = {};
      const list = t.announcements.map((a) => a.trim()).filter(Boolean);
      if (list.length) entry.announcements = list;
      if (t.hero.tag?.trim()) entry.hero = { tag: t.hero.tag.trim() };
      for (const s of SECTIONS) {
        const fields = Object.fromEntries(TEXT_FIELDS.map((f) => [f, (t[s.key]?.[f] || "").trim()]).filter(([, v]) => v));
        if (Object.keys(fields).length) (entry as any)[s.key] = fields;
      }
      if (Object.keys(entry).length) cleanI18n[l] = entry;
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
            i18n: cleanI18n,
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

  const placeholderFor = (key: SectionKey, field: string) => (isAz ? "" : draft[key]?.[field] || "");

  return (
    <>
      <PageHeader
        title="Sayt kontenti"
        description="Hər dil üçün ayrıca mətn yazın. Başqa dildə boş qalan sahədə saytın hazır tərcüməsi göstərilir."
        actions={
          <Button variant="primary" loading={saving} onClick={save}>
            Yadda saxla
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-white p-1" role="tablist" aria-label="Dil">
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={lang === l}
            onClick={() => setLang(l)}
            className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors", lang === l ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100")}
          >
            {LANG_LABEL[l]}
            {l !== "az" && translatedCount(l) > 0 && <span className="ml-1.5 text-xs opacity-70">({translatedCount(l)})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {isAz && (
          <Card title="Əlaqə">
            <div className="p-5">
              <Field label="WhatsApp dəstək nömrəsi" hint="Bütün dillərdə saytdakı bütün WhatsApp düymələri bu nömrəyə yönəlir." className="max-w-sm">
                <Input inputMode="tel" value={draft.whatsappNumber} onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })} placeholder="+994 10 328 31 52" />
              </Field>
            </div>
          </Card>
        )}

        <Card
          title={`Elan zolağı · ${LANG_LABEL[lang]}`}
          actions={
            <Button size="sm" onClick={() => setAnnouncements([...announcements, ""])}>
              <Plus className="h-4 w-4" /> Elan əlavə et
            </Button>
          }
        >
          <div className="space-y-2 p-5">
            <p className="text-xs text-stone-500">Saytın ən yuxarısında axan mətnlər. Siyahı boş qalsa, saytın standart elanları göstərilir.</p>
            {announcements.map((text, i) => (
              <div key={i} className="flex gap-2">
                <Input value={text} aria-label={`Elan ${i + 1}`} onChange={(e) => setAnnouncements(announcements.map((a, ai) => (ai === i ? e.target.value : a)))} />
                <Button variant="ghost" aria-label={`Elan ${i + 1}-i sil`} onClick={() => setAnnouncements(announcements.filter((_, ai) => ai !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`Ana səhifə: nişan zolağı · ${LANG_LABEL[lang]}`}>
          <div className="p-5">
            <Field label="Birinci nişan mətni" hint="Ana səhifədə böyük şəklin üstündə fırlanan nişanların birincisi.">
              <Input value={heroTag} onChange={(e) => setHeroTag(e.target.value)} placeholder={isAz ? "" : draft.heroTag} />
            </Field>
          </div>
        </Card>

        {SECTIONS.map((s) => {
          const b = banner(s.key);
          return (
            <Card key={s.key} title={`${s.title} · ${LANG_LABEL[lang]}`}>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Kiçik başlıq">
                  <Input value={b.tag || ""} onChange={(e) => setBanner(s.key, "tag", e.target.value)} placeholder={placeholderFor(s.key, "tag")} />
                </Field>
                <Field label="Əsas başlıq">
                  <Input value={b.title || ""} onChange={(e) => setBanner(s.key, "title", e.target.value)} placeholder={placeholderFor(s.key, "title")} />
                </Field>
                <Field label="Mətn" className="sm:col-span-2">
                  <Textarea rows={3} value={b[s.bodyField] || ""} onChange={(e) => setBanner(s.key, s.bodyField, e.target.value)} placeholder={placeholderFor(s.key, s.bodyField)} />
                </Field>
                <Field label="Düymənin mətni">
                  <Input value={b.ctaText || ""} onChange={(e) => setBanner(s.key, "ctaText", e.target.value)} placeholder={placeholderFor(s.key, "ctaText")} />
                </Field>
                {isAz ? (
                  <Field label="Düymənin keçidi" hint="Bütün dillər üçün eynidir. Məs: /collections?category=hudi">
                    <Input value={b.ctaLink || ""} onChange={(e) => setBanner(s.key, "ctaLink", e.target.value)} />
                  </Field>
                ) : (
                  <p className="self-end text-xs text-stone-500">Keçid və şəkil bütün dillər üçün eynidir; onları Azərbaycan bölməsində dəyişin.</p>
                )}
                {isAz && s.hasImage && (
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
