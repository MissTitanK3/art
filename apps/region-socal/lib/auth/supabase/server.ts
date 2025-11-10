import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureSupabaseEnv } from "./utils";

type SupabaseTarget = "region" | "admin";

/**
 * For SSR or API routes that use anon keys (default region or admin DB)
 */
export async function createSupabaseServerClient(
  target: SupabaseTarget = "region",
) {
  const cookieStore = await cookies();
  const env =
    target === "admin"
      ? ensureSupabaseEnv("admin")
      : ensureSupabaseEnv("server");

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      async getAll() {
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Safe to ignore if run inside a Server Component
        }
      },
    },
  });
}

/**
 * For privileged server-only actions using the admin service role key.
 */
export function createSupabaseAdminServiceClient() {
  const env = ensureSupabaseEnv("admin");

  if (!env.serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY_ADMIN for admin service operations.",
    );
  }

  return createServerClient(env.url, env.serviceRoleKey, {
    cookies: {
      // No cookie context for service clients
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
