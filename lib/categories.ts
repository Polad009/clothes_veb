// Category helpers shared by the storefront and the admin panel (no server imports).

export const LANGS = ['az', 'en', 'ru', 'tr'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABEL: Record<Lang, string> = { az: 'Azərbaycan', en: 'English', ru: 'Русский', tr: 'Türkçe' };

export interface Category {
  /** Used in links (/collections?category=…) and on every product; never changes once created. */
  id: string;
  /** Azerbaijani name (the default). */
  title: string;
  titles?: Partial<Record<Lang, string>>;
  /** Azerbaijani description shown on the collection page. */
  desc?: string;
  descriptions?: Partial<Record<Lang, string>>;
  image?: string;
  /** Hidden categories stay on their products but disappear from the site's menus. */
  active: boolean;
  /** Shown in the header menu. */
  showInMenu?: boolean;
  sortOrder?: number;
}

export const CATEGORY_ID_RE = /^[a-z0-9-]{2,40}$/;

export function categoryTitle(c: Category, lang: string): string {
  return (c.titles?.[lang as Lang] || '').trim() || c.title || c.id;
}

export function categoryDescription(c: Category, lang: string): string {
  return (c.descriptions?.[lang as Lang] || '').trim() || (lang === 'az' ? c.desc || '' : '');
}

/** Used only when the database has no categories at all. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'koynek', title: 'Köynək', titles: { en: 'Shirts', ru: 'Рубашки', tr: 'Gömlek' }, active: true, showInMenu: true, sortOrder: 1 },
  { id: 'hudi', title: 'Hudi', titles: { en: 'Hoodies', ru: 'Худи', tr: 'Hudi' }, active: true, showInMenu: true, sortOrder: 2 },
  { id: 'salvar', title: 'Şalvar', titles: { en: 'Pants', ru: 'Брюки', tr: 'Pantolon' }, active: true, showInMenu: true, sortOrder: 3 },
  { id: 'aksesuar', title: 'Aksesuar', titles: { en: 'Accessories', ru: 'Аксессуары', tr: 'Aksesuar' }, active: true, showInMenu: true, sortOrder: 4 },
];

/** Active categories in display order; the defaults when none are stored. */
export function visibleCategories(list: Category[] | undefined | null): Category[] {
  const source = Array.isArray(list) && list.length > 0 ? list : DEFAULT_CATEGORIES;
  return source
    .filter((c) => c.active !== false)
    .slice()
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
}

/** "T-Shirt və köynəklər" → ["T-Shirt və", "köynəklər"]: the last word is set in italics on the collection page. */
export function splitForHeading(text: string): [string, string] {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return ['', text.trim()];
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
}
