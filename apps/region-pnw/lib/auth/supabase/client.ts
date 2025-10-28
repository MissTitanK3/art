// apps/region-pnw/lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from './utils';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const env = ensureSupabaseEnv('client');
  // Recommended browser-side client from @supabase/ssr to ensure consistent cookie handling
  browserClient = createBrowserClient(env.url, env.anonKey);
  return browserClient;
}
