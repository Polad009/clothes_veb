"use client";

import React, { useRef, useState } from "react";
import { Download, FileUp, Loader2, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, useToast } from "@/components/admin/ui";

export interface PrintFile {
  name: string;
  url: string;
  desc?: string;
}

/** Download link that saves the file instead of opening it (Supabase supports ?download=). */
function downloadHref(f: PrintFile): string {
  const file = (f.name || "dizayn").replace(/[<>:"/\\|?*]/g, "").trim().replace(/\s+/g, "-") || "dizayn";
  const ext = /\.svg(\?|$)/i.test(f.url) ? ".svg" : ".png";
  if (/supabase\.co\/storage\/v1\/object\/public\//.test(f.url)) {
    return `${f.url}${f.url.includes("?") ? "&" : "?"}download=${encodeURIComponent(file + ext)}`;
  }
  return f.url;
}

/**
 * The product's print-ready design files (transparent background), ready to download
 * and send to the print shop. New PNG files can be added here.
 */
export function PrintFiles({ value, onChange }: { value: PrintFile[]; onChange: (next: PrintFile[]) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (!/\.png$/i.test(file.name)) {
      toast.error("Çap faylı şəffaf fonlu PNG olmalıdır.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Fayl yüklənmədi.");
      onChange([...value, { name: file.name.replace(/\.png$/i, ""), url: data.url, desc: "" }]);
      toast.success("Çap faylı əlavə olundu. Yadda saxlamağı unutmayın.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title={`Çap faylları${value.length ? ` · ${value.length}` : ""}`}
      actions={
        <Button size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} PNG əlavə et
        </Button>
      }
    >
      <div className="space-y-3 p-5">
        <p className="text-xs text-stone-500">
          Bu məhsulun dizaynları, şəffaf fonda. "Yüklə" ilə kompüterə endirib çap sexinə göndərin. SVG faylı vektordur: istənilən ölçüdə keyfiyyət itmir.
        </p>
        {value.length === 0 && <p className="text-sm text-stone-500">Hələ çap faylı yoxdur.</p>}
        <ul className="space-y-3">
          {value.map((f, i) => (
            <li key={`${f.url}-${i}`} className="flex flex-col gap-3 rounded-lg border border-stone-200 p-3 sm:flex-row sm:items-center">
              {/* checkerboard so the transparent background is visible */}
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-stone-200"
                style={{
                  backgroundColor: "#fff",
                  backgroundImage:
                    "linear-gradient(45deg,#d6d3d1 25%,transparent 25%),linear-gradient(-45deg,#d6d3d1 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d6d3d1 75%),linear-gradient(-45deg,transparent 75%,#d6d3d1 75%)",
                  backgroundSize: "12px 12px",
                  backgroundPosition: "0 0,0 6px,6px -6px,-6px 0",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.name} className="max-h-full max-w-full object-contain" loading="lazy" />
              </div>
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <Field label="Ad">
                  <Input value={f.name} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                </Field>
                <Field label="Qeyd (yer, ölçü, rəng)">
                  <Input value={f.desc || ""} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))} />
                </Field>
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={downloadHref(f)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-900 px-3 text-sm font-medium text-white hover:bg-stone-700"
                >
                  <Download className="h-4 w-4" /> Yüklə
                </a>
                <Button size="sm" variant="ghost" aria-label={`${f.name} faylını sil`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <input
          ref={input}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) upload(file);
          }}
        />
      </div>
    </Card>
  );
}
