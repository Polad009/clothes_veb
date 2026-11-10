"use client";

import React, { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button, Card, Field, Input, useToast } from "@/components/admin/ui";

const SITE = "https://www.horwalle.com";

function randomCode(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return "hw-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function call(body?: unknown) {
  const res = await fetch("/api/admin/credentials", {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Xəta (${res.status})`);
  return data as { username: string; accessKey: string };
}

export function AdminCredentialsCard() {
  const toast = useToast();
  const [current, setCurrent] = useState<{ username: string; accessKey: string } | null>(null);

  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [show, setShow] = useState(false);

  const [linkPassword, setLinkPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    call()
      .then((d) => {
        setCurrent(d);
        setUsername(d.username);
        setAccessKey(d.accessKey);
      })
      .catch((e) => toast.error(e.message));
  }, [toast]);

  const link = current?.accessKey ? `${SITE}/admin?access=${current.accessKey}` : "";

  const savePassword = async () => {
    if (newPassword !== repeat) {
      toast.error("Yeni şifrə ilə təkrarı eyni deyil.");
      return;
    }
    setBusy("password");
    try {
      const d = await call({ action: "password", currentPassword, username, newPassword });
      setCurrent(d);
      setCurrentPassword("");
      setNewPassword("");
      setRepeat("");
      toast.success("Şifrə dəyişdirildi. Növbəti girişdə yenisini istifadə edin.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const saveLink = async () => {
    setBusy("link");
    try {
      const d = await call({ action: "access-key", currentPassword: linkPassword, accessKey: accessKey.trim() });
      setCurrent(d);
      setLinkPassword("");
      toast.success("Admin linki dəyişdirildi. Köhnə link 30 saniyə ərzində işləməyəcək.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const type = show ? "text" : "password";

  return (
    <Card title="Admin girişi">
      <div className="divide-y divide-stone-100">
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-stone-900">İstifadəçi adı və şifrə</p>
            <button type="button" onClick={() => setShow(!show)} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {show ? "Gizlət" : "Göstər"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="İstifadəçi adı">
              <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} autoComplete="username" />
            </Field>
            <Field label="Hazırkı şifrə">
              <Input type={type} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </Field>
            <Field label="Yeni şifrə" hint="Ən azı 10 simvol, həm hərf, həm rəqəm.">
              <Input type={type} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </Field>
            <Field label="Yeni şifrə (təkrar)">
              <Input type={type} value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" />
            </Field>
          </div>
          <Button variant="primary" loading={busy === "password"} disabled={!currentPassword || !newPassword || !repeat} onClick={savePassword}>
            Şifrəni dəyiş
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-sm font-medium text-stone-900">Admin linki</p>
            <p className="mt-0.5 text-xs text-stone-500">Bu link olmadan admin panel görünmür. Yadda saxlaması asan, amma başqasının təxmin edə bilməyəcəyi bir kod seçin.</p>
          </div>
          {link && (
            <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <code className="min-w-0 flex-1 break-all text-xs text-stone-700">{link}</code>
              <Button
                size="sm"
                onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link kopyalandı."))}
                aria-label="Linki kopyala"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yeni link kodu" hint="8–64 simvol: latın hərfləri, rəqəm, tire.">
              <div className="flex gap-2">
                <Input value={accessKey} onChange={(e) => setAccessKey(e.target.value.trim())} />
                <Button onClick={() => setAccessKey(randomCode())} aria-label="Təsadüfi kod yarat">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </Field>
            <Field label="Hazırkı şifrə">
              <Input type="password" value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} autoComplete="current-password" />
            </Field>
          </div>
          <Button loading={busy === "link"} disabled={!linkPassword || !accessKey || accessKey === current?.accessKey} onClick={saveLink}>
            Linki dəyiş
          </Button>
        </div>
      </div>
    </Card>
  );
}
