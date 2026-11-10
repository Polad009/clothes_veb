"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { Card, ConfirmButton, Field, Input, PageHeader, Textarea, useToast } from "@/components/admin/ui";

export function CampaignComposer({ recipients, emailConfigured }: { recipients: number; emailConfigured: boolean }) {
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [ctaLink, setCtaLink] = useState("https://www.horwalle.com/collections");
  const [result, setResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  const ready = subject.trim() && headline.trim() && message.trim();
  const canSend = Boolean(ready && emailConfigured && recipients > 0);

  const send = async () => {
    if (!/^https:\/\//.test(ctaLink.trim())) {
      toast.error('Düymənin keçidi "https://" ilə başlamalıdır.');
      return;
    }
    try {
      const res = await adminFetch<{ result: { total: number; sent: number; failed: number } }>("/api/admin/broadcast-email", {
        body: {
          subject: subject.trim(),
          headline: headline.trim(),
          message: message.trim(),
          promoCode: promoCode.trim().toUpperCase() || undefined,
          ctaLink: ctaLink.trim(),
        },
      });
      setResult(res.result);
      if (res.result.failed === 0) toast.success(`${res.result.sent} müştəriyə göndərildi.`);
      else toast.error(`${res.result.sent} göndərildi, ${res.result.failed} alınmadı.`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader title="E-poçt kampaniyası" description={`Qeydiyyatlı bütün müştərilərə göndərilir: ${recipients} ünvan.`} />

      {!emailConfigured && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            E-poçt xidməti qoşulmayıb, ona görə göndərmək mümkün deyil. Vercel-də <code className="font-mono text-xs">RESEND_API_KEY</code> əlavə
            edildikdən sonra bu düymə işləyəcək. Sifariş təsdiqi və status e-poçtları da hazırda getmir.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Məktub" className="lg:col-span-3">
          <div className="space-y-4 p-5">
            <Field label="Mövzu (e-poçt başlığı)">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Məs: Yeni hudi kolleksiyası gəldi" />
            </Field>
            <Field label="Böyük başlıq">
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </Field>
            <Field label="Mətn">
              <Textarea rows={7} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Promokod (istəyə görə)" hint="Mövcud və aktiv kod yazın.">
                <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="font-mono uppercase" />
              </Field>
              <Field label="Düymənin keçidi">
                <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
              <p className="text-xs text-stone-500">Göndərildikdən sonra geri qaytarmaq olmur.</p>
              {canSend ? (
                <ConfirmButton size="md" onConfirm={send} confirmLabel={`Bəli, ${recipients} nəfərə göndər`}>
                  Göndər
                </ConfirmButton>
              ) : (
                <span className="text-xs text-stone-500">
                  {!emailConfigured ? "E-poçt xidməti qoşulmayıb" : recipients === 0 ? "Alıcı yoxdur" : "Mövzu, başlıq və mətni doldurun"}
                </span>
              )}
            </div>
            {result && (
              <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">
                Nəticə: {result.sent} göndərildi, {result.failed} alınmadı (cəmi {result.total}).
              </p>
            )}
          </div>
        </Card>

        <Card title="Önizləmə" className="lg:col-span-2">
          <div className="p-5">
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <div className="bg-[#111011] px-5 py-4 text-center text-[13px] font-semibold tracking-[0.2em] text-[#E6C280]">HORWALLE</div>
              <div className="space-y-3 px-5 py-5">
                <p className="text-lg font-semibold text-stone-900">{headline || "Böyük başlıq"}</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">{message || "Mətn burada görünəcək."}</p>
                {promoCode && (
                  <p className="rounded-lg border border-dashed border-stone-300 py-2 text-center font-mono text-sm font-semibold">{promoCode}</p>
                )}
                <span className="inline-block rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white">Kolleksiyaya bax</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
