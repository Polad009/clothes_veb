import type { SupabaseClient } from '@supabase/supabase-js';
import { applyCampaigns } from '@/lib/campaigns';
import { listCampaigns } from './campaigns';
import { db } from './client';
import { listProducts, type CatalogProduct } from './products';

/**
 * Products as shoppers see and pay for them: running discounts applied.
 * The admin panel uses listProducts() so it always edits the real base price.
 */
export async function listCatalog(client: SupabaseClient = db()): Promise<CatalogProduct[]> {
  const [products, campaigns] = await Promise.all([listProducts(client), listCampaigns(client)]);
  // hidden products stay in the admin (and in old orders) but are not sold;
  // print-ready design files are for the admin only, never in public responses
  return applyCampaigns(
    products.filter((p) => !p.hidden).map((p) => ({ ...p, printLayers: [] })),
    campaigns
  );
}
