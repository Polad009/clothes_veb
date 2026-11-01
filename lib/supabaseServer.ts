import { createClient } from '@supabase/supabase-js';

const REAL_SUPABASE_URL = 'https://hrgvvsyalafdscponoca.supabase.co';
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('hrgvvsyalafdscponoca'))
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : REAL_SUPABASE_URL;

function getServiceRoleKey(): string | null {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  return null;
}

const supabaseKey = getServiceRoleKey();

export const supabaseServer = (supabaseUrl && supabaseKey)
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

