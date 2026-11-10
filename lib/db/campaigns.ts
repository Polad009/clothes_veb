import type { SupabaseClient } from '@supabase/supabase-js';
import { type Campaign, cleanCampaign } from '@/lib/campaigns';
import { db, unwrap } from './client';

// Stored as one document in site_settings (key 'campaigns'): a shop has a handful of them.
const KEY = 'campaigns';

export async function listCampaigns(client: SupabaseClient = db()): Promise<Campaign[]> {
  const row = unwrap(await client.from('site_settings').select('value').eq('key', KEY).maybeSingle(), 'Endirimlər oxunmadı');
  const list = (row?.value as any)?.list;
  return Array.isArray(list) ? list : [];
}

async function writeAll(list: Campaign[]) {
  unwrap(
    await db().from('site_settings').upsert({ key: KEY, value: { list }, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    'Endirimlər yadda saxlanılmadı'
  );
}

export async function saveCampaign(input: unknown): Promise<Campaign> {
  const campaign = cleanCampaign(input);
  const list = await listCampaigns();
  const index = list.findIndex((c) => c.id === campaign.id);
  if (index >= 0) list[index] = campaign;
  else list.unshift(campaign);
  await writeAll(list);
  return campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const list = await listCampaigns();
  await writeAll(list.filter((c) => c.id !== id));
}
