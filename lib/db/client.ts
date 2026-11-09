import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabaseServer';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

/**
 * The one database the whole app reads from and writes to.
 * There is deliberately no file or in-memory fallback: if Supabase is not
 * configured the request fails loudly instead of silently diverging.
 */
export function db(): SupabaseClient {
  if (!supabaseServer) {
    throw new Error('Supabase konfiqurasiya olunmayıb: SUPABASE_SERVICE_ROLE_KEY tələb olunur.');
  }
  return supabaseServer;
}

/** Throws a readable error when a Supabase call failed. */
export function unwrap<T>(res: { data: T; error: { message: string } | null }, context: string): T {
  if (res.error) {
    throw new Error(`${context}: ${res.error.message}`);
  }
  return res.data;
}
