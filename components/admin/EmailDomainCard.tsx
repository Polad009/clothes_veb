"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Field, Input, useToast } from "@/components/admin/ui";
import type { EmailDomainStatus } from "@/lib/email/domain";

type Status = EmailDomainStatus & { sender?: string };

const STATUS_LABEL: Record<string, { label: string; tone: "green" | "amber" | "red" | "neutral" }> = {
  verified: { label: "Təsdiqlənib", tone: "green" },
  pending: { label: "DNS gözlənilir", tone: "amber" },
  not_started: { label: "DNS gözlənilir", tone: "amber" },
  temporary_failure: { label: "Müvəqqəti xəta", tone: "amber" },
  failed: { label: "Təsdiqlənmədi", tone: "red" },
};

export function EmailDomainCard() {
  const toast = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [to, setTo] = useState("");

  const call = useCallback(async (init?: RequestInit) => {
    const res = await fetch("/api/admin/email-domain", { cache: "no-store", ...init });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Xəta (${res.status})`);
    return data;
  }, []);

  const load = useCallback(async () => {
    try {
      setStatus(await call());
    } catch (e: any) {
      setStatus({ configured: true, domain: null, error: e.message });
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action: "setup" | "verify" | "test") => {
    setBusy(action);
    try {
      const data = await call({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, to }),
      });
      if (action === "test") toast.success(`Test e-poçtu ${to} ünvanına göndərildi.`);
      else setStatus(data);
      if (data.error) toast.error(data.error);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const d = status?.domain;
  const state = d ? STATUS_LABEL[d.status] || { label: d.status, tone: "neutral" as const } : null;

  return (
    <Card title="E-poçt göndərmə" actions={state ? <Badge tone={state.tone}>{state.label}</Badge> : undefined}>
      <div className="space-y-4 p-5 text-sm">
        {!status ? (
          <p className="text-stone-500">Yoxlanılır…</p>
        ) : !status.configured ? (
          <p className="text-stone-700">Vercel-də <code className="font-mono text-xs">RESEND_API_KEY</code> yoxdur, e-poçt göndərilmir.</p>
        ) : (
          <>
            <p className="text-stone-600">
              Göndərən: <span className="font-medium text-stone-900">{status.sender}</span>
            </p>
            {status.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700">{status.error}</p>}

            {!d ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-stone-600">horwalle.com domeni Resend-də hələ əlavə edilməyib.</p>
                <Button variant="primary" loading={busy === "setup"} onClick={() => act("setup")}>Domeni əlavə et</Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-stone-200">
                  <table className="w-full min-w-[560px] text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-left text-stone-500">
                        <th className="px-3 py-2 font-medium">Növ</th>
                        <th className="px-3 py-2 font-medium">Ad</th>
                        <th className="px-3 py-2 font-medium">Dəyər</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {d.records.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-mono">{r.type}{r.priority != null ? ` ${r.priority}` : ""}</td>
                          <td className="px-3 py-2 font-mono">{r.name}</td>
                          <td className="max-w-[260px] break-all px-3 py-2 font-mono text-stone-600">{r.value}</td>
                          <td className="px-3 py-2">{r.status === "verified" ? <Badge tone="green">hazır</Badge> : <Badge tone="amber">{r.status}</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button loading={busy === "verify"} onClick={() => act("verify")}>DNS-i yenidən yoxla</Button>
                </div>
                <div className="flex flex-wrap items-end gap-2 border-t border-stone-200 pt-4">
                  <Field label="Test e-poçtu göndər" className="min-w-[220px] flex-1">
                    <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="sizin@email.com" />
                  </Field>
                  <Button loading={busy === "test"} disabled={!to.trim() || d.status !== "verified"} onClick={() => act("test")}>
                    Göndər
                  </Button>
                </div>
                {d.status !== "verified" && (
                  <p className="text-xs text-stone-500">Test e-poçtu domen təsdiqləndikdən sonra göndərilə bilər. DNS adətən bir neçə dəqiqəyə, bəzən bir neçə saata yayılır.</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
