import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import type {
  AdapterCookie,
  AuthServerAdapter,
  AuthServerContext,
} from "../../types";
import { ensureSupabaseEnv, mapSupabaseSession } from "./common";

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
        context.cookies.setAll(cookiesToSet);
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
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn("[supabase auth] failed to fetch session", error);
      return null;
    }
    return mapSupabaseSession(data.session);
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
