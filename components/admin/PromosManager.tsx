"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { StorePromoCode } from "@/lib/db/types";
import { adminFetch, formatDate, formatMoney } from "@/lib/adminClient";
import { Badge, Button, Card, ConfirmButton, EmptyState, Field, Input, Modal, PageHeader, Select, Toggle, useToast } from "@/components/admin/ui";

interface Draft {
  id?: string;
  code: string;
  type: "percent" | "fixed";
  value: string;
  minAmount: string;
  maxUses: string;
  expiresAt: string;
  desc: string;
  active: boolean;
}

const emptyDraft: Draft = { code: "", type: "percent", value: "", minAmount: "", maxUses: "", expiresAt: "", desc: "", active: true };

function isExpired(p: StorePromoCode) {
  return Boolean(p.expiresAt && new Date(p.expiresAt).getTime() < Date.now());
}

function isUsedUp(p: StorePromoCode) {
  return typeof p.maxUses === "number" && p.maxUses > 0 && (p.uses || 0) >= p.maxUses;
}

export function PromosManager({ promos }: { promos: StorePromoCode[] }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const edit = (p: StorePromoCode) => {
    setErrors({});
    setDraft({
      id: p.id,
      code: p.code,
      type: p.type,
      value: String(p.value),
      minAmount: p.minAmount ? String(p.minAmount) : "",
      maxUses: p.maxUses ? String(p.maxUses) : "",
      expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString().slice(0, 10) : "",
      desc: p.desc || "",
      active: p.active,
    });
  };

  const save = async () => {
    if (!draft) return;
    const next: Record<string, string> = {};
    const code = draft.code.trim().toUpperCase();
    const value = Number(draft.value.replace(",", "."));
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) next.code = "3–30 simvol: latın hərfləri, rəqəm, tire.";
    if (!(value > 0)) next.value = "Sıfırdan böyük rəqəm yazın.";
    else if (draft.type === "percent" && value > 100) next.value = "Faiz 100-dən çox ola bilməz.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await adminFetch("/api/admin/promos", {
        body: {
          id: draft.id,
          code,
          type: draft.type,
          value,
          minAmount: Number(draft.minAmount.replace(",", ".")) || 0,
          maxUses: Number(draft.maxUses) > 0 ? Math.round(Number(draft.maxUses)) : null,
          // valid through the end of the chosen day, Baku time
          expiresAt: draft.expiresAt ? `${draft.expiresAt}T23:59:59+04:00` : null,
          desc: draft.desc.trim(),
          active: draft.active,
        },
      });
      toast.success(draft.id ? "Promokod yeniləndi." : `${code} promokodu yaradıldı.`);
      setDraft(null);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: StorePromoCode, active: boolean) => {
    setBusy(p.code);
    try {
      await adminFetch("/api/admin/promos", { body: { id: p.id, code: p.code, active } });
      toast.success(active ? `${p.code} aktiv edildi.` : `${p.code} dayandırıldı.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (p: StorePromoCode) => {
    try {
      await adminFetch(`/api/admin/promos/${encodeURIComponent(p.id || p.code)}`, { method: "DELETE" });
      toast.success(`${p.code} silindi.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Promokodlar"
        description="Kodlar saytda açıq göstərilmir; müştəri yalnız bildiyi kodu ödəniş səhifəsində daxil edə bilər."
        actions={
          <Button variant="primary" onClick={() => { setErrors({}); setDraft(emptyDraft); }}>
            <Plus className="h-4 w-4" /> Yeni promokod
          </Button>
        }
      />

      <Card>
        {promos.length === 0 ? (
          <EmptyState title="Promokod yoxdur" description="Endirim kampaniyası üçün ilk kodunuzu yaradın." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-5 py-2.5 font-medium">Kod</th>
                  <th className="px-3 py-2.5 font-medium">Endirim</th>
                  <th className="px-3 py-2.5 font-medium">Şərtlər</th>
                  <th className="px-3 py-2.5 font-medium">İstifadə</th>
                  <th className="px-3 py-2.5 font-medium">Aktiv</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {promos.map((p) => (
                  <tr key={p.code} className="hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <span className="font-mono text-[13px] font-semibold text-stone-900">{p.code}</span>
                      {p.desc && <p className="mt-0.5 text-xs text-stone-500">{p.desc}</p>}
                    </td>
                    <td className="px-3 py-3 font-medium tabular-nums">{p.type === "fixed" ? `−${formatMoney(p.value)}` : `−${p.value}%`}</td>
                    <td className="px-3 py-3 text-xs text-stone-600">
                      <p>{p.minAmount ? `Minimum ${formatMoney(p.minAmount)}` : "Minimum yoxdur"}</p>
                      <p className="mt-0.5">
                        {p.expiresAt ? `${formatDate(p.expiresAt, false)} tarixinədək` : "Müddətsiz"}{" "}
                        {isExpired(p) && <Badge tone="red">Vaxtı bitib</Badge>}
                      </p>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {p.uses || 0}{p.maxUses ? ` / ${p.maxUses}` : ""} {isUsedUp(p) && <Badge tone="amber">Limit dolub</Badge>}
                    </td>
                    <td className="px-3 py-3">
                      <Toggle checked={p.active} disabled={busy === p.code} onChange={(next) => toggle(p, next)} label={`${p.code}: aktiv`} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => edit(p)}>Düzəlt</Button>
                        <ConfirmButton onConfirm={() => remove(p)}>Sil</ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Promokodu düzəlt" : "Yeni promokod"}
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Ləğv et</Button>
            <Button variant="primary" loading={saving} onClick={save}>Yadda saxla</Button>
          </>
        }
      >
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kod" error={errors.code} className="sm:col-span-2">
              <Input value={draft.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="BAKU2026" className="font-mono uppercase" autoFocus />
            </Field>
            <Field label="Endirim növü">
              <Select value={draft.type} onChange={(e) => set({ type: e.target.value as Draft["type"] })}>
                <option value="percent">Faiz (%)</option>
                <option value="fixed">Sabit məbləğ (₼)</option>
              </Select>
            </Field>
            <Field label={draft.type === "percent" ? "Faiz" : "Məbləğ (₼)"} error={errors.value}>
              <Input inputMode="decimal" value={draft.value} onChange={(e) => set({ value: e.target.value })} placeholder={draft.type === "percent" ? "10" : "5"} />
            </Field>
            <Field label="Minimum səbət (₼)" hint="Boş = məhdudiyyət yoxdur">
              <Input inputMode="decimal" value={draft.minAmount} onChange={(e) => set({ minAmount: e.target.value })} />
            </Field>
            <Field label="İstifadə limiti" hint="Boş = limitsiz">
              <Input inputMode="numeric" value={draft.maxUses} onChange={(e) => set({ maxUses: e.target.value })} />
            </Field>
            <Field label="Son tarix" hint="Boş = müddətsiz">
              <Input type="date" value={draft.expiresAt} onChange={(e) => set({ expiresAt: e.target.value })} />
            </Field>
            <Field label="Daxili qeyd">
              <Input value={draft.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="Məs: Instagram kampaniyası" />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 sm:col-span-2">
              <span className="text-sm font-medium text-stone-900">Aktivdir</span>
              <Toggle checked={draft.active} onChange={(active) => set({ active })} label="Aktivdir" />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
