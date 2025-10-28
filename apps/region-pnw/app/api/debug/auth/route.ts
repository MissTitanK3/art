import { NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { getServerSession } from "@/lib/auth/server";
import { getAuthProviderId } from "@/lib/auth/adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const provider = getAuthProviderId();
  const cookieStore = await nextCookies();
  const cookieNames = cookieStore.getAll().map((c) => c.name);
  const session = await getServerSession();

  const has = (key: string) => Boolean(process.env[key] && String(process.env[key]).length > 0);

  return NextResponse.json({
    ok: true,
    provider,
    cookies: {
      names: cookieNames,
    },
    serverSession: session
      ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          },
          provider: session.provider ?? null,
          expiresAt: session.expiresAt ?? null,
        }
      : null,
    env: {
      NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? null,
      NEXT_PUBLIC_SUPABASE_URL_present: has("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY_present: has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    },
  });
}

