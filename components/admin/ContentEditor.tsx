"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminClient";
import { Button, Card, Field, Input, PageHeader, Textarea, useToast } from "@/components/admin/ui";

type Banner = Record<string, string>;

interface ContentDraft {
  heroTag: string;
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
    setSaving(true);
    try {
      await adminFetch("/api/admin/content", {
        body: {
          content: {
            hero: { tag: draft.heroTag.trim() },
            podBanner: draft.podBanner,
            promoBanner: draft.promoBanner,
            campaignSecondary: draft.campaignSecondary,
          },
        },
      });
      toast.success("Kontent yadda saxlanıldı. Sayt 15 saniyə ərzində yenilənəcək.");
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
        title="Ana səhifə kontenti"
        description="Buradakı mətnlər saytın Azərbaycan dili versiyasında görünür. Digər dillərin mətnləri hələ koddadır."
        actions={
          <Button variant="primary" disabled={!dirty} loading={saving} onClick={save}>
            Yadda saxla
          </Button>
        }
      />

      <div className="space-y-6">
        <Card title="Yuxarı zolaq">
          <div className="p-5">
            <Field label="Birinci elan mətni" hint="Ana səhifənin yuxarısında fırlanan nişanların birincisi.">
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
