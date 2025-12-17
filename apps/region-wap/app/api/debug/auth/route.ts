import { NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  const cookieStore = await nextCookies();
  const cookieNames = cookieStore.getAll().map((c) => c.name);

  // Also check Supabase server auth for comparison
  const supabase = await createSupabaseServerClient();
  const [{ data: supaUser }, { data: supaSession }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  // Prefer explicit env provider, else infer from Supabase presence
  const provider =
    process.env.NEXT_PUBLIC_AUTH_PROVIDER ??
    (supaUser?.user || supaSession?.session ? "supabase" : "unknown");

  const has = (key: string) =>
    Boolean(process.env[key] && String(process.env[key]).length > 0);

  return NextResponse.json({
    ok: true,
    provider,
    cookies: {
      names: cookieNames,
    },
    serverSession: null,
    supabaseAuth:
      supaUser?.user || supaSession?.session
        ? {
            user: supaUser?.user
              ? {
                  id: supaUser.user.id,
                  email: supaUser.user.email,
                  role:
                    (supaUser.user as any)?.role ??
                    (supaUser.user as any)?.user_metadata?.role ??
                    null,
                }
              : null,
            session: supaSession?.session
              ? {
                  expiresAt: (supaSession.session as any)?.expires_at ?? null,
                }
              : null,
          }
        : null,
    env: {
      NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? null,
      NEXT_PUBLIC_SUPABASE_URL_present: has("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY_present: has(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ),
    },
  });
}
