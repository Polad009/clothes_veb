"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { LANG_LABEL, LANGS, type Lang } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { DEFAULT_PHOTOS } from "@/components/store/photos";
import { ImageField } from "@/components/admin/ImageField";
import { Button, Card, Field, Input, PageHeader, Textarea, useToast } from "@/components/admin/ui";

type Texts = Record<string, string>;
const HERO_TEXT = ["tag", "title", "text"] as const;
const STUDIO_TEXT = ["tag", "title", "description", "ctaText"] as const;

/** Texts in one language. Links and photos are shared by all languages. */
interface LangTexts {
  announcements: string[];
  hero: Texts;
  podBanner: Texts;
}

export interface IntroVideoDraft {
  enabled: boolean;
  desktop: string;
  mobile: string;
}

export interface ContentDraft {
  introVideo?: IntroVideoDraft;
  announcements: string[];
  whatsappNumber: string;
  hero: Texts; // tag, title, text, photo, link
  podBanner: Texts; // tag, title, description, ctaText, ctaLink, photo
  i18n?: Partial<Record<Lang, Partial<LangTexts>>>;
}

const emptyTexts = (): LangTexts => ({ announcements: [], hero: {}, podBanner: {} });
const pick = (obj: Texts | undefined, keys: readonly string[]) =>
  Object.fromEntries(keys.map((k) => [k, (obj?.[k] || "").trim()]).filter(([, v]) => v));
const okLink = (v: string) => !v || /^(\/|https:\/\/)/.test(v);
const okImage = (v: string) => !v || /^(\/|https:\/\/)/.test(v);

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
  const [video, setVideo] = useState<IntroVideoDraft>(initial.introVideo || { enabled: true, desktop: "", mobile: "" });
  const okVideo = (v: string) => !v.trim() || /^(\/|https:\/\/).+\.(mp4|webm)(\?.*)?$/i.test(v.trim());
  const [saving, setSaving] = useState(false);

  const isAz = lang === "az";
  const other = isAz ? null : i18n[lang as Exclude<Lang, "az">];

  // read/write helpers for the language being edited
  const announcements = isAz ? draft.announcements : other!.announcements;
  const setAnnouncements = (list: string[]) =>
    isAz ? setDraft({ ...draft, announcements: list }) : setI18n({ ...i18n, [lang]: { ...other!, announcements: list } });
  const text = (section: "hero" | "podBanner", field: string) => (isAz ? draft[section][field] : other![section]?.[field]) || "";
  const setText = (section: "hero" | "podBanner", field: string, value: string) =>
    isAz
      ? setDraft((d) => ({ ...d, [section]: { ...d[section], [field]: value } }))
      : setI18n((all) => {
          const cur = all[lang as Exclude<Lang, "az">];
          return { ...all, [lang]: { ...cur, [section]: { ...(cur[section] || {}), [field]: value } } };
        });
  const azHint = (section: "hero" | "podBanner", field: string) => (isAz ? "" : draft[section]?.[field] || "");
  const setShared = (section: "hero" | "podBanner", field: string, value: string) =>
    setDraft((d) => ({ ...d, [section]: { ...d[section], [field]: value } }));

  const translatedCount = (l: Exclude<Lang, "az">) => {
    const t = i18n[l];
    return t.announcements.filter(Boolean).length + Object.keys(pick(t.hero, HERO_TEXT)).length + Object.keys(pick(t.podBanner, STUDIO_TEXT)).length;
  };

  const save = async () => {
    if (!okLink(draft.hero.link || "") || !okLink(draft.podBanner.ctaLink || "")) {
      toast.error('Düymə keçidi "/" və ya "https://" ilə başlamalıdır.');
      return;
    }
    if (!okImage(draft.hero.photo || "") || !okImage(draft.podBanner.photo || "")) {
      toast.error('Şəkil ünvanı "/" və ya "https://" ilə başlamalıdır.');
      return;
    }
    if (!okVideo(video.desktop) || !okVideo(video.mobile)) {
      toast.error('Video ünvanı "/" və ya "https://" ilə başlamalı və .mp4 ya .webm ilə bitməlidir.');
      return;
    }
    const phoneDigits = draft.whatsappNumber.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      toast.error("WhatsApp nömrəsini ölkə kodu ilə tam yazın. Məs: +994 10 328 31 52");
      return;
    }

    // keep only filled-in translations
    const cleanI18n: Record<string, Partial<LangTexts>> = {};
    for (const l of ["en", "ru", "tr"] as const) {
      const t = i18n[l];
      const entry: Partial<LangTexts> = {};
      const list = t.announcements.map((a) => a.trim()).filter(Boolean);
      if (list.length) entry.announcements = list;
      const hero = pick(t.hero, HERO_TEXT);
      if (Object.keys(hero).length) entry.hero = hero;
      const studio = pick(t.podBanner, STUDIO_TEXT);
      if (Object.keys(studio).length) entry.podBanner = studio;
      if (Object.keys(entry).length) cleanI18n[l] = entry;
    }

    const trimAll = (o: Texts) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, (v || "").trim()]));
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        body: {
          settings: { whatsappNumber: draft.whatsappNumber.trim() },
          content: {
            introVideo: { enabled: video.enabled, desktop: video.desktop.trim(), mobile: video.mobile.trim() },
            announcements: draft.announcements.map((a) => a.trim()).filter(Boolean),
            hero: trimAll(draft.hero),
            podBanner: trimAll(draft.podBanner),
            i18n: cleanI18n,
          },
        },
      });
      toast.success("Yadda saxlanıldı. Dəyişiklik saytda bir dəqiqə ərzində görünür.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const sharedNote = <p className="text-xs text-stone-500">Şəkil və keçid bütün dillər üçün eynidir; onları Azərbaycan bölməsində dəyişin.</p>;

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
            <p className="text-xs text-stone-500">Saytın ən yuxarısındakı zolaqda növbə ilə göstərilir. Siyahı boş qalsa, standart elan göstərilir.</p>
            {announcements.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input value={a} aria-label={`Elan ${i + 1}`} onChange={(e) => setAnnouncements(announcements.map((x, xi) => (xi === i ? e.target.value : x)))} />
                <Button variant="ghost" aria-label={`Elan ${i + 1}-i sil`} onClick={() => setAnnouncements(announcements.filter((_, xi) => xi !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`Ana səhifə: əsas blok · ${LANG_LABEL[lang]}`}>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Kiçik başlıq" hint="Böyük başlığın üstündəki kiçik yazı.">
              <Input value={text("hero", "tag")} onChange={(e) => setText("hero", "tag", e.target.value)} placeholder={azHint("hero", "tag")} />
            </Field>
            <Field label="Böyük başlıq" hint="Qısa olsun: 1–3 söz. Boş = “Yeni sezon”.">
              <Input value={text("hero", "title")} onChange={(e) => setText("hero", "title", e.target.value)} placeholder={azHint("hero", "title")} />
            </Field>
            <Field label="Mətn" className="sm:col-span-2">
              <Textarea rows={2} value={text("hero", "text")} onChange={(e) => setText("hero", "text", e.target.value)} placeholder={azHint("hero", "text")} />
            </Field>
            {isAz ? (
              <>
                <Field label="“İndi al” düyməsinin keçidi" hint="Boş = bütün məhsullar (/collections).">
                  <Input value={draft.hero.link || ""} onChange={(e) => setShared("hero", "link", e.target.value)} placeholder="/collections" />
                </Field>
                <div className="sm:col-span-2">
                  <ImageField
                    wide
                    label="Böyük foto (sağ tərəfdə)"
                    hint="Şaquli, tünd fonlu, insanlı foto ən yaxşı görünür. Boş = standart foto."
                    value={draft.hero.photo || ""}
                    onChange={(url) => setShared("hero", "photo", url)}
                    fallback={DEFAULT_PHOTOS.hero}
                  />
                </div>
              </>
            ) : (
              sharedNote
            )}
          </div>
        </Card>

        {isAz && (
          <Card title="Ana səhifə: giriş videosu">
            <div className="space-y-4 p-5">
              <label className="flex items-center gap-3 text-sm font-medium text-stone-900">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-stone-900"
                  checked={video.enabled}
                  onChange={(e) => setVideo({ ...video, enabled: e.target.checked })}
                />
                Saytın ən yuxarısında videonu göstər
              </label>
              <p className="text-xs text-stone-500">
                Boş saxlasanız, saytın öz videosu göstərilir. Öz videonuzu qoymaq üçün .mp4 faylının linkini yazın (səssiz oynadılır).
                Telefon üçün şaquli (9:16), kompüter üçün üfüqi (16:9) video ən yaxşı görünür; 5 MB-dan kiçik olsun.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kompüter üçün video (mp4)">
                  <Input value={video.desktop} onChange={(e) => setVideo({ ...video, desktop: e.target.value })} placeholder="Boş = standart video" />
                </Field>
                <Field label="Telefon üçün video (mp4)" hint="Boş = kompüter videosu və ya standart.">
                  <Input value={video.mobile} onChange={(e) => setVideo({ ...video, mobile: e.target.value })} placeholder="Boş = standart video" />
                </Field>
              </div>
            </div>
          </Card>
        )}

        <Card title={`Ana səhifə: dizayn studiyası bloku · ${LANG_LABEL[lang]}`}>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Kiçik başlıq">
              <Input value={text("podBanner", "tag")} onChange={(e) => setText("podBanner", "tag", e.target.value)} placeholder={azHint("podBanner", "tag")} />
            </Field>
            <Field label="Əsas başlıq">
              <Input value={text("podBanner", "title")} onChange={(e) => setText("podBanner", "title", e.target.value)} placeholder={azHint("podBanner", "title")} />
            </Field>
            <Field label="Mətn" className="sm:col-span-2">
              <Textarea rows={3} value={text("podBanner", "description")} onChange={(e) => setText("podBanner", "description", e.target.value)} placeholder={azHint("podBanner", "description")} />
            </Field>
            <Field label="Düymənin mətni">
              <Input value={text("podBanner", "ctaText")} onChange={(e) => setText("podBanner", "ctaText", e.target.value)} placeholder={azHint("podBanner", "ctaText")} />
            </Field>
            {isAz ? (
              <>
                <Field label="Düymənin keçidi" hint="Boş = /studio">
                  <Input value={draft.podBanner.ctaLink || ""} onChange={(e) => setShared("podBanner", "ctaLink", e.target.value)} placeholder="/studio" />
                </Field>
                <div className="sm:col-span-2">
                  <ImageField
                    label="Foto"
                    hint="Ağ fonda boş geyim fotosu ən yaxşı görünür."
                    value={draft.podBanner.photo || ""}
                    onChange={(url) => setShared("podBanner", "photo", url)}
                    fallback={DEFAULT_PHOTOS.studio}
                  />
                </div>
              </>
            ) : (
              sharedNote
            )}
          </div>
        </Card>

        <p className="text-xs text-stone-500">
          Kateqoriya bannerlərinin (Köynək, Hudi, …) fotoları <a href="/admin/categories" className="underline">Kateqoriyalar</a> bölməsində dəyişdirilir.
        </p>
      </div>
    </>
  );
}
