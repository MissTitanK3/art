import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const has = (key: string) => Boolean(process.env[key] && String(process.env[key]).length > 0);
  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? null,
      NEXT_PUBLIC_SITE_URL_present: has('NEXT_PUBLIC_SITE_URL'),
      NEXT_PUBLIC_SUPABASE_URL_present: has('NEXT_PUBLIC_SUPABASE_URL'),
      NEXT_PUBLIC_SUPABASE_ANON_KEY_present: has('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY_present: has('SUPABASE_SERVICE_ROLE_KEY'),
    },
  });
}

