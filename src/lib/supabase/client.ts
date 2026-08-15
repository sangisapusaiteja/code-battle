import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Uses @supabase/ssr so the session lives in
 * cookies, not localStorage.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  return createBrowserClient(url, anonKey);
}
