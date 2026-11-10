"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { Button, Input, useToast } from "@/components/admin/ui";

/**
 * Image picker for the admin: upload a file or paste a URL. Shows `fallback`
 * (what the site uses when nothing is set) greyed out.
 */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  fallback,
  wide = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  fallback?: string;
  wide?: boolean;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const shown = value || fallback || "";

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      toast.error("4 MB-dan kiçik şəkil seçin (JPG, PNG və ya WEBP).");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await adminFetch<{ url: string }>("/api/admin/upload", { form });
      onChange(res.url);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-stone-700">{label}</span>
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-100 text-stone-400 hover:border-stone-900 ${wide ? "h-24 w-40" : "h-24 w-20"}`}
          aria-label={`${label}: şəkil yüklə`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className={`h-full w-full object-cover ${value ? "" : "opacity-50"}`} />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-[200px] flex-1 space-y-2">
          <Input value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="Yüklə və ya https://… ünvanı yaz" />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
              Şəkil yüklə
            </Button>
            {value && (
              <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                Standart şəklə qaytar
              </Button>
            )}
          </div>
          {hint && <p className="text-xs text-stone-500">{hint}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} />
    </div>
  );
}
