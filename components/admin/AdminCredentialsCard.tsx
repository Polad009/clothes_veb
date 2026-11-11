"use client";

import React, { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw, Trash2, UserPlus } from "lucide-react";
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
  return data as Creds;
}

type Staff = { username: string; name: string; createdAt: string };
type Creds = { username: string; accessKey: string; staff?: Staff[] };

export function AdminCredentialsCard() {
  const toast = useToast();
  const [current, setCurrent] = useState<Creds | null>(null);

  const [staffName, setStaffName] = useState("");
  const [staffUser, setStaffUser] = useState("");
  const [staffPass, setStaffPass] = useState("");
  const [staffOwnerPass, setStaffOwnerPass] = useState("");

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

  const addStaffUser = async () => {
    setBusy("staff");
    try {
      const d = await call({ action: "add-staff", currentPassword: staffOwnerPass, username: staffUser.trim(), name: staffName.trim(), password: staffPass });
      setCurrent(d);
      setStaffName("");
      setStaffUser("");
      setStaffPass("");
      toast.success("İşçi hesabı yaradıldı. Admin linkini və bu giriş məlumatlarını ona verin.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const removeStaffUser = async (u: string) => {
    if (!staffOwnerPass) {
      toast.error("Silmək üçün aşağıda öz hazırkı şifrənizi yazın.");
      return;
    }
    if (!window.confirm(`${u} hesabı silinsin? Bu işçi 12 saat ərzində paneldən çıxarılacaq.`)) return;
    setBusy(`rm-${u}`);
    try {
      const d = await call({ action: "remove-staff", currentPassword: staffOwnerPass, username: u });
      setCurrent(d);
      toast.success("İşçi hesabı silindi.");
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

        <div className="space-y-4 p-5">
          <div>
            <p className="text-sm font-medium text-stone-900">İşçi hesabları</p>
            <p className="mt-0.5 text-xs text-stone-500">
              İşçi sifarişlərə, öz dizayn sifarişlərinə, canlı çata və məhsullara baxa və onları yeniləyə bilir. Ayarlar, qiymətlər, endirimlər, hesabatlar, müştəri siyahısı və silmə əməliyyatları yalnız sizə açıqdır.
            </p>
          </div>
          {(current?.staff || []).length > 0 && (
            <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
              {(current?.staff || []).map((u) => (
                <li key={u.username} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">{u.name}</p>
                    <p className="text-xs text-stone-500">{u.username}</p>
                  </div>
                  <Button size="sm" variant="danger" loading={busy === `rm-${u.username}`} onClick={() => removeStaffUser(u.username)} aria-label={`${u.username} hesabını sil`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad">
              <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Məs.: Aysel" />
            </Field>
            <Field label="İstifadəçi adı" hint="Latın hərfləri, rəqəm, nöqtə, tire.">
              <Input value={staffUser} onChange={(e) => setStaffUser(e.target.value.toLowerCase())} autoComplete="off" />
            </Field>
            <Field label="İşçinin şifrəsi" hint="Ən azı 10 simvol, həm hərf, həm rəqəm.">
              <Input type={type} value={staffPass} onChange={(e) => setStaffPass(e.target.value)} autoComplete="new-password" />
            </Field>
            <Field label="Sizin hazırkı şifrəniz">
              <Input type="password" value={staffOwnerPass} onChange={(e) => setStaffOwnerPass(e.target.value)} autoComplete="current-password" />
            </Field>
          </div>
          <Button loading={busy === "staff"} disabled={!staffUser || !staffPass || !staffOwnerPass} onClick={addStaffUser}>
            <UserPlus className="h-4 w-4" /> İşçi əlavə et
          </Button>
        </div>
      </div>
    </Card>
  );
}
