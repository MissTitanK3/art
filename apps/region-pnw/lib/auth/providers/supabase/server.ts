import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import type {
  AdapterCookie,
  AuthServerAdapter,
  AuthServerContext,
} from "../../types";
import { ensureSupabaseEnv, mapSupabaseUser } from "./common";

async function resolveCookieStore() {
  try {
    return await nextCookies();
  } catch {
    return null;
  }
}

function createCookiesBridge(
  store: Awaited<ReturnType<typeof resolveCookieStore>>,
  context?: AuthServerContext
) {
  return {
    getAll(): AdapterCookie[] {
      if (context?.cookies) {
        return context.cookies.getAll();
      }
      if (!store) return [];
      return store.getAll().map(({ name, value }) => ({
        name,
        value,
      }));
    },
    setAll(cookiesToSet: AdapterCookie[]) {
      if (context?.cookies?.setAll) {
        try {
          context.cookies.setAll(cookiesToSet);
        } catch {
          // Ignore if upstream context cannot mutate cookies in this environment
        }
      }
      if (!store) return;
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set(name, value, options as CookieOptions | undefined);
        });
      } catch {
        // When called from a Server Component the cookie store can be read-only.
      }
    },
  };
}

export async function createSupabaseServerAdapter(
  context?: AuthServerContext
): Promise<AuthServerAdapter> {
  const env = ensureSupabaseEnv("server");
  const store = await resolveCookieStore();
  const cookies = createCookiesBridge(store, context);

  const client = createServerClient(env.url, env.anonKey, {
    cookies,
  });

  async function getSession() {
    // Validate the user by contacting Supabase Auth
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) {
      // Likely missing/invalid cookies; treat as unauthenticated
      return null;
    }
    const user = userData.user;
    if (!user) return null;

    // Optionally retrieve tokens for client-side convenience
    let access_token: string | undefined;
    let refresh_token: string | undefined;
    let expires_at_ms: number | undefined;
    try {
      const { data: sessionData } = await client.auth.getSession();
      access_token = sessionData.session?.access_token ?? undefined;
      refresh_token = sessionData.session?.refresh_token ?? undefined;
      expires_at_ms = sessionData.session?.expires_at
        ? sessionData.session.expires_at * 1000
        : undefined;
    } catch {
      // ignore; user is authenticated regardless of token fetch
    }

    return mapSupabaseUser(user, { access_token, refresh_token, expires_at_ms });
  }

  return {
    getSession,
    async requireSession() {
      const session = await getSession();
      if (!session) {
        throw new Error("AUTH_REQUIRED");
      }
      return session;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
  };
}
