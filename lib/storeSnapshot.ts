import { revalidateTag } from 'next/cache';
import defaults from '@/data/storeData.json';
import { createCachedReadClient } from '@/lib/supabaseServer';
import type { CatalogProduct } from '@/lib/db/products';
import { listCatalog } from '@/lib/db/catalog';
import { getContent, getSettings, publicSettings } from '@/lib/db/site';

export const STORE_TAG = 'store';

export interface StoreSnapshot {
  products: CatalogProduct[];
  content: Record<string, any>;
  settings: Record<string, any>;
}

// Reads go through Next's data cache under STORE_TAG: pages are prerendered
// with live data, and an admin save refreshes them at once via refreshStore().
// The 60s window is only a safety net for changes made outside the admin.
const readClient = createCachedReadClient(STORE_TAG, 60);

/**
 * Everything the storefront renders with. Server-rendering from this means
 * visitors never see stale bundled data first.
 * Never throws: if the database is unreachable the page still renders and the
 * browser fetches the data itself.
 */
export async function getStoreSnapshot(): Promise<StoreSnapshot> {
  try {
    if (!readClient) throw new Error('Supabase konfiqurasiya olunmayıb.');
    const [products, content, settings] = await Promise.all([
      listCatalog(readClient),
      getContent(readClient),
      getSettings(readClient),
    ]);
    return { products, content: content as Record<string, any>, settings: publicSettings(settings as Record<string, any>) };
  } catch (error) {
    console.error('[StoreSnapshot] Could not load store data:', error);
    const { categories: _categories, ...content } = defaults.content as Record<string, any>;
    return { products: [], content, settings: defaults.settings };
  }
}

/** Call after any admin change that the storefront shows. */
export function refreshStore(): void {
  revalidateTag(STORE_TAG);
}
