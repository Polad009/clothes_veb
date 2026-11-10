"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.error || "Giriş alınmadı.");
        return;
      }
      // Full navigation: drops the access key from the address bar and loads the panel with the session cookie
      window.location.replace("/admin");
    } catch {
      setError("Serverə qoşulmaq alınmadı.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#1A1517] px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-[#E6C280]">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-[13px] font-semibold tracking-[0.2em] text-stone-900">HORWALLE</p>
          <h1 className="font-sans mt-1 text-lg font-semibold text-stone-900">İdarəetmə panelinə giriş</h1>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-stone-700">İstifadəçi adı</span>
          <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label className="mb-5 block">
          <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Şifrə</span>
          <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-lg bg-stone-900 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
        >
          {busy ? "Yoxlanılır…" : "Daxil ol"}
        </button>
      </form>
    </div>
  );
}
