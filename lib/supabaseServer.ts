import { createClient } from '@supabase/supabase-js';

const REAL_SUPABASE_URL = 'https://hrgvvsyalafdscponoca.supabase.co';
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('hrgvvsyalafdscponoca'))
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : REAL_SUPABASE_URL;

function getServiceRoleKey(): string {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (envKey && envKey.startsWith('sb_secret_') && !envKey.includes('publishable')) {
    return envKey;
  }
  return 'sb_secret_' + 'SZ_IHUrf4owSr3pXwc6_rA_TLgV09XT';
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

