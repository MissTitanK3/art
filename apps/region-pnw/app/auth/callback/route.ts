import { NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CallbackBody = {
  event:
    | "SIGNED_IN"
    | "SIGNED_OUT"
    | "PASSWORD_RECOVERY"
    | "TOKEN_REFRESHED"
    | "USER_UPDATED"
    | string;
  session: {
    access_token?: string | null;
    refresh_token?: string | null;
  } | null;
};

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    );
  }

  const cookieStore = await nextCookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options as CookieOptions | undefined);
          } catch {
            // In some server contexts cookie store may be read-only;
            // best-effort update only.
          }
        });
      },
    },
  });

  let body: CallbackBody | null = null;
  try {
    body = (await req.json()) as CallbackBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = body?.event;
  const accessToken = body?.session?.access_token ?? null;
  const refreshToken = body?.session?.refresh_token ?? null;

  try {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      } else {
        // fall back to querying current session to ensure cookies are set
        await supabase.auth.getSession();
      }
    } else if (event === "SIGNED_OUT") {
      await supabase.auth.signOut();
    }
  } catch {
    // Ignore; client remains logged in and cookies can refresh later
  }

  return NextResponse.json({ ok: true });
}

// Ensure this handler never gets statically optimized and always runs per-request
export const dynamic = "force-dynamic";
export const revalidate = 0;
