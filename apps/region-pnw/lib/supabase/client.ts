// apps/region-pnw/lib/supabase/client.ts
"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ensureSupabaseEnv } from "@/lib/auth/providers/supabase/common";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const env = ensureSupabaseEnv("client");
  browserClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return browserClient;
}

