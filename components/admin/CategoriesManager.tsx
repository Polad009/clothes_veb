"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { type Category, CATEGORY_ID_RE, LANG_LABEL, LANGS, type Lang } from "@/lib/categories";
import { Badge, Button, Card, ConfirmButton, EmptyState, Field, Input, Modal, PageHeader, Textarea, Toggle, useToast } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { DEFAULT_PHOTOS } from "@/components/store/photos";

interface Draft {
  create: boolean;
  id: string;
  titles: Record<Lang, string>;
  descriptions: Record<Lang, string>;
  image: string;
  banner: string;
  active: boolean;
  showInMenu: boolean;
}

const empty = (): Record<Lang, string> => ({ az: "", en: "", ru: "", tr: "" });

function slugify(input: string): string {
  const map: Record<string, string> = { ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g" };
  return input
    .toLowerCase()
    .replace(/[əıöüşçğ]/g, (ch) => map[ch] || ch)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function toDraft(c: Category): Draft {
  const titles = empty();
  const descriptions = empty();
  titles.az = c.title || "";
  descriptions.az = c.desc || "";
  for (const l of ["en", "ru", "tr"] as Lang[]) {
    titles[l] = c.titles?.[l] || "";
    descriptions[l] = c.descriptions?.[l] || "";
  }
  return { create: false, id: c.id, titles, descriptions, image: c.image || "", banner: c.banner || "", active: c.active !== false, showInMenu: c.showInMenu !== false };
}

export function CategoriesManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const orphanIds = Object.keys(counts).filter((id) => !categories.some((c) => c.id === id));

  const save = async (patch: Partial<Category> & { id: string }, okMessage?: string) => {
    setBusy(patch.id);
    try {
      await adminFetch("/api/admin/categories", { body: patch });
      if (okMessage) toast.success(okMessage);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const ids = categories.map((c) => c.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await adminFetch("/api/admin/categories/reorder", { body: { ids } });
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (c: Category) => {
    try {
      await adminFetch(`/api/admin/categories/${encodeURIComponent(c.id)}`, { method: "DELETE" });
      toast.success(`"${c.title}" silindi.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !draft) return;
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      toast.error("4 MB-dan kiçik şəkil seçin.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await adminFetch<{ url: string }>("/api/admin/upload", { form });
      setDraft({ ...draft, image: res.url });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!draft) return;
    if (!draft.titles.az.trim()) {
      toast.error("Azərbaycan dilində ad mütləqdir.");
      setLang("az");
      return;
    }
    if (!CATEGORY_ID_RE.test(draft.id)) {
      toast.error("Kod 2–40 simvol olmalıdır: kiçik latın hərfləri, rəqəm, tire.");
      return;
    }
    setSaving(true);
    try {
      await adminFetch("/api/admin/categories", {
        body: {
          create: draft.create,
          id: draft.id,
          title: draft.titles.az,
          desc: draft.descriptions.az,
          titles: { en: draft.titles.en, ru: draft.titles.ru, tr: draft.titles.tr },
          descriptions: { en: draft.descriptions.en, ru: draft.descriptions.ru, tr: draft.descriptions.tr },
          image: draft.image,
          banner: draft.banner,
          active: draft.active,
          showInMenu: draft.showInMenu,
        },
      });
      toast.success(draft.create ? "Kateqoriya yaradıldı və saytda görünür." : "Yadda saxlanıldı.");
      setDraft(null);
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
        title="Kateqoriyalar"
        description="Saytın menyusu, kolleksiya səhifəsindəki tablar və məhsul formasındakı seçim bu siyahıdan gəlir."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setLang("az");
              setDraft({ create: true, id: "", titles: empty(), descriptions: empty(), image: "", banner: "", active: true, showInMenu: true });
            }}
          >
            <Plus className="h-4 w-4" /> Yeni kateqoriya
          </Button>
        }
      />

      {orphanIds.length > 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bəzi məhsulların kateqoriyası siyahıda yoxdur ({orphanIds.join(", ")}). Bu məhsullar menyuda görünmür; onları redaktə edib kateqoriya seçin.
        </p>
      )}

      <Card>
        {categories.length === 0 ? (
          <EmptyState title="Kateqoriya yoxdur" description="Sayt hazırda standart 4 kateqoriyanı göstərir. Öz kateqoriyalarınızı yaradın." />
        ) : (
          <ul className="divide-y divide-stone-100">
            {categories.map((c, i) => {
              const count = counts[c.id] || 0;
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                  <div className="flex flex-col">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`${c.title}: yuxarı`} className="rounded p-0.5 text-stone-400 hover:text-stone-900 disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={i === categories.length - 1} onClick={() => move(i, 1)} aria-label={`${c.title}: aşağı`} className="rounded p-0.5 text-stone-400 hover:text-stone-900 disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 bg-stone-100 object-cover" />
                  ) : (
                    <span className="h-12 w-12 shrink-0 rounded-lg border border-dashed border-stone-300 bg-stone-50" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900">
                      {c.title} <span className="font-mono text-xs font-normal text-stone-400">{c.id}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-stone-500">
                      {[c.titles?.en, c.titles?.ru, c.titles?.tr].filter(Boolean).join(" · ") || "Digər dillər yazılmayıb"} · {count} məhsul
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-stone-600">
                      <Toggle checked={c.active !== false} disabled={busy === c.id} onChange={(v) => save({ id: c.id, active: v }, v ? "Saytda göstərilir." : "Saytdan gizlədildi.")} label={`${c.title}: saytda`} />
                      Saytda
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-stone-600">
                      <Toggle checked={c.showInMenu !== false} disabled={busy === c.id || c.active === false} onChange={(v) => save({ id: c.id, showInMenu: v })} label={`${c.title}: menyuda`} />
                      Menyuda
                    </label>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => { setLang("az"); setDraft(toDraft(c)); }}>Düzəlt</Button>
                    {count > 0 ? (
                      <Badge tone="neutral">{count} məhsul</Badge>
                    ) : (
                      <ConfirmButton onConfirm={() => remove(c)}>Sil</ConfirmButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.create ? "Yeni kateqoriya" : "Kateqoriyanı düzəlt"}
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Ləğv et</Button>
            <Button variant="primary" loading={saving} onClick={submit}>Yadda saxla</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="flex gap-1" role="tablist" aria-label="Dil">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="tab"
                  aria-selected={lang === l}
                  onClick={() => setLang(l)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${lang === l ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}
                >
                  {LANG_LABEL[l]}
                  {l !== "az" && !draft.titles[l] ? " ·" : ""}
                </button>
              ))}
            </div>

            <Field label={`Ad (${LANG_LABEL[lang]})`} hint={lang === "az" ? "Mütləqdir." : "Boş qalsa Azərbaycan dilindəki ad göstərilir."}>
              <Input
                value={draft.titles[lang]}
                onChange={(e) => {
                  const value = e.target.value;
                  const next = { ...draft, titles: { ...draft.titles, [lang]: value } };
                  if (draft.create && lang === "az" && (draft.id === "" || draft.id === slugify(draft.titles.az))) next.id = slugify(value);
                  setDraft(next);
                }}
                placeholder={lang === "az" ? "Məs: Sviter" : ""}
              />
            </Field>
            <Field label={`Təsvir (${LANG_LABEL[lang]})`} hint="Kolleksiya səhifəsində başlığın altında görünür.">
              <Textarea rows={2} value={draft.descriptions[lang]} onChange={(e) => setDraft({ ...draft, descriptions: { ...draft.descriptions, [lang]: e.target.value } })} />
            </Field>

            <Field label="Kod" hint={draft.create ? "Linkdə görünür (/collections?category=…). Sonradan dəyişmək olmur." : "Kod dəyişdirilə bilməz: məhsullar ona bağlıdır."}>
              <Input value={draft.id} disabled={!draft.create} onChange={(e) => setDraft({ ...draft, id: slugify(e.target.value) })} className="font-mono" />
            </Field>

            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Kiçik şəkil (menyu və axtarış üçün, istəyə görə)</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-400 hover:border-stone-900"
                  aria-label="Şəkil yüklə"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : draft.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-5 w-5" />
                  )}
                </button>
                {draft.image && <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, image: "" })}>Şəkli sil</Button>}
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} />
            </div>

            <ImageField
              wide
              label="Ana səhifə banner fotosu (sağ tərəfdə böyük)"
              hint="Bu kateqoriyanın ana səhifədəki bannerində görünür. Tünd fonlu, insanlı foto ən yaxşısıdır. Boş = standart foto."
              value={draft.banner}
              onChange={(url) => setDraft({ ...draft, banner: url })}
              fallback={DEFAULT_PHOTOS[draft.id] || DEFAULT_PHOTOS.hero}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
                <span className="text-sm text-stone-900">Saytda göstər</span>
                <Toggle checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Saytda göstər" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
                <span className="text-sm text-stone-900">Üst menyuda</span>
                <Toggle checked={draft.showInMenu} onChange={(v) => setDraft({ ...draft, showInMenu: v })} label="Üst menyuda" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
