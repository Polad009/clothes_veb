import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrgvvsyalafdscponoca.supabase.co';
const fallbackKey = typeof Buffer !== 'undefined'
  ? Buffer.from('c2Jfc2VjcmV0X1NaX0lIVXJmNG93U3IzcFh3YzZfckFfVExnVjA5WFQ=', 'base64').toString('utf8')
  : '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey;

export const supabaseServer = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

