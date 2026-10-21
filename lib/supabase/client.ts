/**
 * Supabase Client Configuration
 * Fallback values are provided for development before environment variables are set.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Lazy / safe client initialization
export function getSupabaseClient() {
  // Can import @supabase/supabase-js when installed or use REST/fetch
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
  };
}
