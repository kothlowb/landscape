import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Uses @supabase/ssr so that when auth is
// added later, session cookies are handled consistently with the server
// client without changing call sites.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
