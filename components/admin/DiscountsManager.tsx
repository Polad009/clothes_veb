"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { type Campaign, type CampaignScope, campaignState, type CampaignState } from "@/lib/campaigns";
import { adminFetch, formatDate, formatMoney } from "@/lib/adminClient";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, ConfirmButton, EmptyState, Field, Input, Modal, PageHeader, Select, Toggle, useToast } from "@/components/admin/ui";

type P = { id: string; name: string; category: string; price: number; image: string };
type C = { id: string; title: string };

const STATE: Record<CampaignState, { label: string; tone: "green" | "blue" | "neutral" | "amber" }> = {
  running: { label: "Davam edir", tone: "green" },
  scheduled: { label: "Planlaşdırılıb", tone: "blue" },
  ended: { label: "Bitib", tone: "neutral" },
  paused: { label: "Dayandırılıb", tone: "amber" },
};

/** ISO → value for <input type="datetime-local"> in the browser's time zone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const blank = (): Campaign => ({
  id: "",
  name: "",
  percent: 10,
  scope: "all",
  categoryIds: [],
  productIds: [],
  startsAt: null,
  endsAt: null,
  active: true,
  showCountdown: true,
  badge: "",
});

export function DiscountsManager({ campaigns, products, categories }: { campaigns: Campaign[]; products: P[]; categories: C[] }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<(Campaign & { startLocal: string; endLocal: string; percentText: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const open = (c: Campaign) => setDraft({ ...c, startLocal: toLocalInput(c.startsAt), endLocal: toLocalInput(c.endsAt), percentText: String(c.percent) });

  const covered = (c: Pick<Campaign, "scope" | "categoryIds" | "productIds">) =>
    products.filter((p) => c.scope === "all" || (c.scope === "categories" ? c.categoryIds.includes(p.category) : c.productIds.includes(p.id)));

  const draftCovered = useMemo(() => (draft ? covered(draft) : []), [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await adminFetch("/api/admin/discounts", {
        body: {
          ...draft,
          percent: Number(draft.percentText),
          startsAt: draft.startLocal ? new Date(draft.startLocal).toISOString() : null,
          endsAt: draft.endLocal ? new Date(draft.endLocal).toISOString() : null,
        },
      });
      toast.success(draft.id ? "Endirim yeniləndi." : "Endirim yaradıldı.");
      setDraft(null);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Campaign, active: boolean) => {
    setBusy(c.id);
    try {
      await adminFetch("/api/admin/discounts", { body: { ...c, active } });
      toast.success(active ? `"${c.name}" aktiv edildi.` : `"${c.name}" dayandırıldı.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (c: Campaign) => {
    try {
      await adminFetch(`/api/admin/discounts?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
      toast.success("Endirim silindi.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const scopeText = (c: Campaign) =>
    c.scope === "all"
      ? "Bütün məhsullar"
      : c.scope === "categories"
      ? c.categoryIds.map((id) => categories.find((x) => x.id === id)?.title || id).join(", ")
      : `${c.productIds.length} məhsul`;

  const pickList = (key: "categoryIds" | "productIds", id: string) =>
    draft && setDraft({ ...draft, [key]: draft[key].includes(id) ? draft[key].filter((x) => x !== id) : [...draft[key], id] });

  return (
    <>
      <PageHeader
        title="Endirimlər"
        description="Müddətli faiz endirimləri. Saytda qiymət endirimli göstərilir, köhnə qiymət üstündən xətt çəkilir; ödənişdə də endirimli qiymət tətbiq olunur. Eyni məhsula bir neçə endirim düşərsə, ən böyüyü keçir."
        actions={
          <Button variant="primary" onClick={() => open(blank())}>
            <Plus className="h-4 w-4" /> Yeni endirim
          </Button>
        }
      />

      <Card>
        {campaigns.length === 0 ? (
          <EmptyState title="Endirim yoxdur" description="Məsələn: “Hudilərə 20% — bazar gününədək” yaradın; vaxtı çatanda öz-özünə başlayıb bitir." />
        ) : (
          <ul className="divide-y divide-stone-100">
            {campaigns.map((c) => {
              const state = STATE[campaignState(c)];
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-700">−{c.percent}%</div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-stone-900">
                      {c.name} <Badge tone={state.tone}>{state.label}</Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {scopeText(c)} · {c.startsAt ? formatDate(c.startsAt) : "indidən"} → {c.endsAt ? formatDate(c.endsAt) : "müddətsiz"} · {covered(c).length} məhsula düşür
                    </p>
                  </div>
                  <Toggle checked={c.active} disabled={busy === c.id} onChange={(v) => toggle(c, v)} label={`${c.name}: aktiv`} />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => open(c)}>Düzəlt</Button>
                    <ConfirmButton onConfirm={() => remove(c)}>Sil</ConfirmButton>
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
        title={draft?.id ? "Endirimi düzəlt" : "Yeni endirim"}
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Ləğv et</Button>
            <Button variant="primary" loading={saving} onClick={submit}>Yadda saxla</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
              <Field label="Ad" hint="Yalnız sizə görünür.">
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Məs: Qış hudi endirimi" autoFocus />
              </Field>
              <Field label="Endirim %">
                <Input inputMode="numeric" value={draft.percentText} onChange={(e) => setDraft({ ...draft, percentText: e.target.value.replace(/\D/g, "").slice(0, 2) })} />
              </Field>
            </div>

            <Field label="Nəyə tətbiq olunur">
              <Select value={draft.scope} onChange={(e) => setDraft({ ...draft, scope: e.target.value as CampaignScope })}>
                <option value="all">Bütün məhsullar</option>
                <option value="categories">Seçilmiş kateqoriyalar</option>
                <option value="products">Seçilmiş məhsullar</option>
              </Select>
            </Field>

            {draft.scope === "categories" && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={draft.categoryIds.includes(c.id)}
                    onClick={() => pickList("categoryIds", c.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      draft.categoryIds.includes(c.id) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-700 hover:border-stone-900"
                    )}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            )}

            {draft.scope === "products" && (
              <ul className="max-h-56 divide-y divide-stone-100 overflow-y-auto rounded-lg border border-stone-200">
                {products.map((p) => (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-stone-50">
                      <input type="checkbox" checked={draft.productIds.includes(p.id)} onChange={() => pickList("productIds", p.id)} className="h-4 w-4 accent-stone-900" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="h-9 w-7 rounded object-cover" />
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      <span className="text-xs text-stone-500 tabular-nums">{formatMoney(p.price)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlayır" hint="Boş = dərhal">
                <Input type="datetime-local" value={draft.startLocal} onChange={(e) => setDraft({ ...draft, startLocal: e.target.value })} />
              </Field>
              <Field label="Bitir" hint="Boş = müddətsiz">
                <Input type="datetime-local" value={draft.endLocal} onChange={(e) => setDraft({ ...draft, endLocal: e.target.value })} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Şəkil üzərindəki nişan" hint={`Boş = −${draft.percentText || "?"}%`}>
                <Input value={draft.badge} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} placeholder="Məs: QIŞ ENDİRİMİ" />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 sm:mt-6">
                <span className="text-sm text-stone-900">Geri sayım göstər</span>
                <Toggle checked={draft.showCountdown && Boolean(draft.endLocal)} disabled={!draft.endLocal} onChange={(v) => setDraft({ ...draft, showCountdown: v })} label="Geri sayım göstər" />
              </div>
            </div>

            <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
              {draftCovered.length} məhsula düşür
              {draftCovered.length > 0 && Number(draft.percentText) > 0 && (
                <>
                  {" "}· məs: {draftCovered[0].name} {formatMoney(draftCovered[0].price)} → {formatMoney(Math.round(draftCovered[0].price * (100 - Number(draft.percentText))) / 100)}
                </>
              )}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
