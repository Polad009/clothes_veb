// Perfume data shared by the storefront, the admin form and the server (no server imports).
// Stored on a product as products.extra.perfume; a product is a perfume when it has this data
// or sits in the `etir` category.

import type { Phrase } from '@/components/store/i18n';

export const PERFUME_CATEGORY = 'etir';
export const PERFUME_VOLUMES = ['10 ml', '30 ml', '50 ml', '100 ml'];

export const CONCENTRATIONS = {
  edt: { short: 'EDT', label: { az: 'Eau de Toilette', en: 'Eau de Toilette', ru: 'Eau de Toilette', tr: 'Eau de Toilette' }, hint: { az: '5–15% ətir yağı, yüngül', en: '5–15% perfume oil, light', ru: '5–15% масла, лёгкая', tr: '%5–15 esans, hafif' } },
  edp: { short: 'EDP', label: { az: 'Eau de Parfum', en: 'Eau de Parfum', ru: 'Eau de Parfum', tr: 'Eau de Parfum' }, hint: { az: '15–20% ətir yağı, davamlı', en: '15–20% perfume oil, long-lasting', ru: '15–20% масла, стойкая', tr: '%15–20 esans, kalıcı' } },
  parfum: { short: 'Parfum', label: { az: 'Parfum', en: 'Parfum', ru: 'Parfum', tr: 'Parfum' }, hint: { az: '20–30% ətir yağı, çox davamlı', en: '20–30% perfume oil, very long-lasting', ru: '20–30% масла, очень стойкая', tr: '%20–30 esans, çok kalıcı' } },
  extrait: { short: 'Extrait', label: { az: 'Extrait de Parfum', en: 'Extrait de Parfum', ru: 'Extrait de Parfum', tr: 'Extrait de Parfum' }, hint: { az: '30%+ ətir yağı, ən güclü', en: '30%+ perfume oil, the strongest', ru: '30%+ масла, самая насыщенная', tr: '%30+ esans, en yoğun' } },
} satisfies Record<string, { short: string; label: Phrase; hint: Phrase }>;
export type Concentration = keyof typeof CONCENTRATIONS;

export const FAMILIES = {
  woody: { az: 'Odunsu', en: 'Woody', ru: 'Древесный', tr: 'Odunsu' },
  fresh: { az: 'Təravətli', en: 'Fresh', ru: 'Свежий', tr: 'Ferah' },
  citrus: { az: 'Sitrus', en: 'Citrus', ru: 'Цитрусовый', tr: 'Narenciye' },
  floral: { az: 'Çiçəkli', en: 'Floral', ru: 'Цветочный', tr: 'Çiçeksi' },
  amber: { az: 'Amber', en: 'Amber', ru: 'Амбровый', tr: 'Amber' },
  musk: { az: 'Müşk', en: 'Musk', ru: 'Мускусный', tr: 'Misk' },
  gourmand: { az: 'Şirin', en: 'Gourmand', ru: 'Гурманский', tr: 'Gurme' },
  spicy: { az: 'Ədviyyatlı', en: 'Spicy', ru: 'Пряный', tr: 'Baharatlı' },
  aquatic: { az: 'Dəniz', en: 'Aquatic', ru: 'Морской', tr: 'Deniz' },
  leather: { az: 'Dəri', en: 'Leather', ru: 'Кожаный', tr: 'Deri' },
} satisfies Record<string, Phrase>;
export type Family = keyof typeof FAMILIES;

export const LONGEVITY = {
  light: { az: 'Yüngül · 2–4 saat', en: 'Light · 2–4 hours', ru: 'Лёгкая · 2–4 часа', tr: 'Hafif · 2–4 saat' },
  moderate: { az: 'Orta · 4–6 saat', en: 'Moderate · 4–6 hours', ru: 'Средняя · 4–6 часов', tr: 'Orta · 4–6 saat' },
  long: { az: 'Davamlı · 6–8 saat', en: 'Long-lasting · 6–8 hours', ru: 'Стойкая · 6–8 часов', tr: 'Kalıcı · 6–8 saat' },
  verylong: { az: 'Çox davamlı · 8+ saat', en: 'Very long · 8+ hours', ru: 'Очень стойкая · 8+ часов', tr: 'Çok kalıcı · 8+ saat' },
} satisfies Record<string, Phrase>;
export type Longevity = keyof typeof LONGEVITY;

export interface PerfumeInfo {
  concentration?: Concentration;
  families: Family[];
  notes: { top: string; heart: string; base: string };
  longevity?: Longevity;
  /** How to wear it; shown with the ingredients. */
  howToUse?: string;
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

/** Validates admin input; returns null when nothing perfume-specific was filled in. */
export function sanitizePerfume(input: unknown): PerfumeInfo | null {
  if (!input || typeof input !== 'object') return null;
  const src = input as Record<string, any>;
  const concentration = (Object.keys(CONCENTRATIONS) as Concentration[]).find((k) => k === src.concentration);
  const longevity = (Object.keys(LONGEVITY) as Longevity[]).find((k) => k === src.longevity);
  const families = Array.isArray(src.families)
    ? Array.from(new Set(src.families.filter((f: unknown): f is Family => typeof f === 'string' && f in FAMILIES))).slice(0, 4)
    : [];
  const notes = {
    top: clean(src.notes?.top, 200),
    heart: clean(src.notes?.heart, 200),
    base: clean(src.notes?.base, 200),
  };
  const howToUse = clean(src.howToUse, 500);
  const info: PerfumeInfo = { families, notes };
  if (concentration) info.concentration = concentration;
  if (longevity) info.longevity = longevity;
  if (howToUse) info.howToUse = howToUse;
  const empty = !concentration && !longevity && !families.length && !notes.top && !notes.heart && !notes.base && !howToUse;
  return empty ? null : info;
}

export function isPerfume(p: { category?: string; perfume?: PerfumeInfo | null } | null | undefined): boolean {
  return Boolean(p && (p.category === PERFUME_CATEGORY || p.perfume));
}

/** Notes typed as "Bergamot, black pepper" → ["Bergamot", "black pepper"]. */
export function noteList(text: string | undefined): string[] {
  return String(text || '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

/** "50 ml · EDP" for product cards. */
export function perfumeLine(p: { sizes?: string[]; perfume?: PerfumeInfo | null }): string {
  const c = p.perfume?.concentration ? CONCENTRATIONS[p.perfume.concentration].short : '';
  return [p.sizes?.length === 1 ? p.sizes[0] : '', c].filter(Boolean).join(' · ');
}
