import { createClient, SupabaseClient } from '@supabase/supabase-js';

const REAL_SUPABASE_URL = 'https://hrgvvsyalafdscponoca.supabase.co';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('hrgvvsyalafdscponoca'))
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : (process.env.SUPABASE_URL || REAL_SUPABASE_URL);

function getServiceRoleKey(): string | null {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is required in production.');
  }
  return null;
}

const supabaseKey = getServiceRoleKey();

export const supabaseServer: SupabaseClient | null = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    })
  : null;

/**
 * Read-only client for storefront pages. Its requests go through Next's data
 * cache under the given tag, so pages can be prerendered and are refreshed the
 * moment the tag is revalidated (see lib/storeSnapshot.ts).
 */
export function createCachedReadClient(tag: string, revalidateSeconds: number): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (url, options) =>
        fetch(url, { ...options, next: { revalidate: revalidateSeconds, tags: [tag] } } as RequestInit),
    },
  });
}
