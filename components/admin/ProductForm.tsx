"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import type { CatalogProduct } from "@/lib/db/products";
import { adminFetch, CATEGORIES, GENDERS } from "@/lib/adminClient";
import { cn } from "@/lib/utils";
import { Button, Card, ConfirmButton, Field, Input, Select, Textarea, Toggle, useToast } from "@/components/admin/ui";

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

interface ColorDraft {
  key: string;
  name: string;
  hex: string;
  image: string;
  hoverImage: string;
  extra: string[];
}

let keySeed = 0;
const newKey = () => `c${Date.now()}_${keySeed++}`;

function toDraft(c: any): ColorDraft {
  const image = c.image || "";
  const hoverImage = c.hoverImage || "";
  const gallery: string[] = Array.isArray(c.gallery) ? c.gallery : [];
  return {
    key: newKey(),
    name: c.name || "",
    hex: /^#[0-9a-f]{6}$/i.test(c.hex || "") ? c.hex : "#111111",
    image,
    hoverImage,
    extra: Array.from(new Set([c.leftShoulderImage, c.rightShoulderImage, ...gallery])).filter(
      (src): src is string => Boolean(src) && src !== image && src !== hoverImage
    ),
  };
}

async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Yalnız şəkil faylı seçin.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Şəkil 4 MB-dan böyükdür. Kiçildib yenidən yükləyin.");
  const form = new FormData();
  form.append("file", file);
  const res = await adminFetch<{ url: string }>("/api/admin/upload", { form });
  return res.url;
}

function ImageSlot({
  src,
  label,
  onChange,
  onRemove,
}: {
  src: string;
  label: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-24">
      <div className="group relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={src ? `${label}: şəkli dəyiş` : `${label}: şəkil yüklə`}
          className={cn(
            "flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border bg-stone-50 text-stone-400 transition-colors hover:border-stone-900 hover:text-stone-900",
            src ? "border-stone-200" : "border-dashed border-stone-300"
          )}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>
        {src && onRemove && !busy && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${label}: şəkli sil`}
            className="absolute -right-1.5 -top-1.5 rounded-full border border-stone-200 bg-white p-0.5 text-stone-600 shadow-sm hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="mt-1 truncate text-center text-[11px] text-stone-500">{label}</p>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pick} />
    </div>
  );
}

export function ProductForm({ product }: { product: CatalogProduct | null }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !product;

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category || "koynek");
  const [gender, setGender] = useState(product?.gender || "unisex");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice != null ? String(product.compareAtPrice) : "");
  const [internationalPrice, setInternationalPrice] = useState(product?.internationalPrice != null ? String(product.internationalPrice) : "");
  const [refCode, setRefCode] = useState(product?.refCode || "");
  const [badge, setBadge] = useState(product?.badge || "");
  const [fit, setFit] = useState(product?.fit || "");
  const [composition, setComposition] = useState(product?.composition || "");
  const [care, setCare] = useState(product?.care || "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [sizes, setSizes] = useState<string[]>(product?.sizes?.length ? product.sizes : ["S", "M", "L", "XL"]);
  const [customSize, setCustomSize] = useState("");
  const [colors, setColors] = useState<ColorDraft[]>(
    product?.colors?.length ? product.colors.map(toDraft) : [{ key: newKey(), name: "", hex: "#111111", image: "", hoverImage: "", extra: [] }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const sizeOptions = Array.from(new Set([...COMMON_SIZES, ...sizes]));
  const patchColor = (key: string, patch: Partial<ColorDraft>) =>
    setColors((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const addCustomSize = () => {
    const value = customSize.trim().toUpperCase().slice(0, 12);
    if (value && !sizes.includes(value)) setSizes([...sizes, value]);
    setCustomSize("");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Məhsulun adını yazın.";
    const priceValue = Number(price.replace(",", "."));
    if (!price.trim() || !Number.isFinite(priceValue) || priceValue <= 0) next.price = "Qiymət sıfırdan böyük rəqəm olmalıdır.";
    const compareValue = Number(compareAtPrice.replace(",", "."));
    if (compareAtPrice.trim() && (!Number.isFinite(compareValue) || compareValue <= priceValue)) {
      next.compareAtPrice = "Köhnə qiymət satış qiymətindən böyük olmalıdır.";
    }
    if (internationalPrice.trim() && !(Number(internationalPrice.replace(",", ".")) > 0)) next.internationalPrice = "Düzgün rəqəm yazın.";
    if (sizes.length === 0) next.sizes = "Ən azı bir ölçü seçin.";
    if (colors.some((c) => !c.image)) next.colors = "Hər rəngin ön şəkli olmalıdır.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Formada düzəliş tələb edən sahələr var.");
      return;
    }
    setSaving(true);
    try {
      const formatted = colors.map((c, i) => ({
        name: c.name.trim() || `Rəng ${i + 1}`,
        hex: c.hex,
        image: c.image,
        hoverImage: c.hoverImage,
        gallery: Array.from(new Set([c.image, c.hoverImage, ...c.extra].filter(Boolean))),
      }));
      const first = formatted[0];
      const num = (v: string) => (v.trim() ? Number(v.replace(",", ".")) : null);

      await adminFetch("/api/admin/products", {
        body: {
          id: product?.id,
          name: name.trim(),
          description: description.trim(),
          category,
          gender,
          price: num(price),
          compareAtPrice: num(compareAtPrice),
          internationalPrice: num(internationalPrice),
          refCode: refCode.trim() || undefined,
          badge: badge.trim(),
          fit: fit.trim(),
          composition: composition.trim(),
          care: care.trim(),
          inStock,
          sizes,
          colors: formatted,
          images: [first.image],
          image: first.image,
          hoverImage: first.hoverImage,
          gallery: first.gallery,
        },
      });
      toast.success(isNew ? "Məhsul əlavə olundu və saytda görünür." : "Dəyişikliklər yadda saxlanıldı.");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await adminFetch(`/api/admin/products/${product!.id}`, { method: "DELETE" });
      toast.success("Məhsul silindi.");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft className="h-4 w-4" /> Məhsullar
      </Link>
      <h1 className="font-sans mb-6 text-2xl font-semibold tracking-tight">{isNew ? "Yeni məhsul" : product!.name}</h1>

      <div className="space-y-6">
        <Card title="Əsas məlumat">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Ad" error={errors.name} className="sm:col-span-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Məs: Angel Dust Vintage Hoodie" />
            </Field>
            <Field label="Təsvir" className="sm:col-span-2">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Parça, kəsim və çap haqqında qısa məlumat" />
            </Field>
            <Field label="Kateqoriya">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Kimin üçün">
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Qiymət və satış">
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Field label="Satış qiyməti (₼)" error={errors.price}>
              <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.99" />
            </Field>
            <Field label="Köhnə qiymət (₼)" hint="Üstündən xətt çəkilmiş göstərilir. Boş qala bilər." error={errors.compareAtPrice}>
              <Input inputMode="decimal" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="45.99" />
            </Field>
            <Field label="Xarici qiymət ($)" hint="Boşdursa, manat qiyməti 1.70-ə bölünür." error={errors.internationalPrice}>
              <Input inputMode="decimal" value={internationalPrice} onChange={(e) => setInternationalPrice(e.target.value)} placeholder="24.99" />
            </Field>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 px-4 py-3 sm:col-span-3">
              <div>
                <p className="text-sm font-medium text-stone-900">Satışdadır</p>
                <p className="text-xs text-stone-500">Söndürəndə məhsul saytda “stokda yoxdur” kimi görünür.</p>
              </div>
              <Toggle checked={inStock} onChange={setInStock} label="Satışdadır" />
            </div>
          </div>
        </Card>

        <Card
          title="Rənglər və şəkillər"
          actions={
            <Button size="sm" onClick={() => setColors([...colors, { key: newKey(), name: "", hex: "#111111", image: "", hoverImage: "", extra: [] }])}>
              <Plus className="h-4 w-4" /> Rəng əlavə et
            </Button>
          }
        >
          <div className="divide-y divide-stone-100">
            {colors.map((c, index) => (
              <div key={c.key} className="p-5">
                <div className="mb-4 flex flex-wrap items-end gap-3">
                  <Field label={`Rəng ${index + 1}`} className="min-w-[180px] flex-1">
                    <Input value={c.name} onChange={(e) => patchColor(c.key, { name: e.target.value })} placeholder="Məs: Washed Black" />
                  </Field>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Çalar</span>
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => patchColor(c.key, { hex: e.target.value })}
                      aria-label={`Rəng ${index + 1} çaları`}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                    />
                  </label>
                  {colors.length > 1 && (
                    <Button variant="ghost" onClick={() => setColors(colors.filter((x) => x.key !== c.key))} aria-label={`Rəng ${index + 1}-i sil`}>
                      <Trash2 className="h-4 w-4" /> Sil
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <ImageSlot src={c.image} label="Ön (əsas)" onChange={(url) => patchColor(c.key, { image: url })} />
                  <ImageSlot src={c.hoverImage} label="Arxa" onChange={(url) => patchColor(c.key, { hoverImage: url })} onRemove={() => patchColor(c.key, { hoverImage: "" })} />
                  {c.extra.map((src, i) => (
                    <ImageSlot
                      key={src + i}
                      src={src}
                      label={`Əlavə ${i + 1}`}
                      onChange={(url) => patchColor(c.key, { extra: c.extra.map((x, xi) => (xi === i ? url : x)) })}
                      onRemove={() => patchColor(c.key, { extra: c.extra.filter((_, xi) => xi !== i) })}
                    />
                  ))}
                  <ImageSlot src="" label="Əlavə şəkil" onChange={(url) => patchColor(c.key, { extra: [...c.extra, url] })} />
                </div>
              </div>
            ))}
          </div>
          {errors.colors && <p className="border-t border-stone-100 px-5 py-3 text-xs text-red-600">{errors.colors}</p>}
        </Card>

        <Card title="Ölçülər">
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => {
                const on = sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSizes(on ? sizes.filter((x) => x !== s) : sizeOptions.filter((x) => x === s || sizes.includes(x)))}
                    className={cn(
                      "h-10 min-w-[3rem] rounded-lg border px-3 text-sm font-medium transition-colors",
                      on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex max-w-xs gap-2">
              <Input
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSize();
                  }
                }}
                placeholder="Başqa ölçü (məs: 32, STD)"
                aria-label="Başqa ölçü əlavə et"
              />
              <Button onClick={addCustomSize}>Əlavə et</Button>
            </div>
            {errors.sizes && <p className="mt-2 text-xs text-red-600">{errors.sizes}</p>}
          </div>
        </Card>

        <Card title="Əlavə detallar">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Məhsul kodu" hint="Boş qalsa avtomatik yaradılır.">
              <Input value={refCode} onChange={(e) => setRefCode(e.target.value)} placeholder="HV-HUD-2026-142" />
            </Field>
            <Field label="Nişan" hint="Şəklin üstündə kiçik etiket. Məs: YENİ">
              <Input value={badge} onChange={(e) => setBadge(e.target.value)} />
            </Field>
            <Field label="Kəsim / növ" hint="Kolleksiya səhifəsində süzgəc kimi görünür.">
              <Input value={fit} onChange={(e) => setFit(e.target.value)} placeholder="Oversize" />
            </Field>
            <Field label="Tərkib">
              <Input value={composition} onChange={(e) => setComposition(e.target.value)} placeholder="100% pambıq, 450 GSM" />
            </Field>
            <Field label="Qulluq" className="sm:col-span-2">
              <Input value={care} onChange={(e) => setCare(e.target.value)} placeholder="30°C-də tərsinə çevirərək yuyun" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div>{!isNew && <ConfirmButton size="md" onConfirm={remove}>Məhsulu sil</ConfirmButton>}</div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button>Ləğv et</Button>
          </Link>
          <Button type="submit" variant="primary" loading={saving}>
            {isNew ? "Məhsulu əlavə et" : "Yadda saxla"}
          </Button>
        </div>
      </div>
    </form>
  );
}
