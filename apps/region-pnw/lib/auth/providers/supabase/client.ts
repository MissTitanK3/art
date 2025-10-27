import {
  createClient,
  type AuthChangeEvent,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { AuthClientAdapter } from "../../types";
import { ensureSupabaseEnv, mapSupabaseSession } from "./common";

let browserClient: SupabaseClient | null = null;

function getBrowserClient(): SupabaseClient {
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

export const supabaseClientAdapter: AuthClientAdapter = {
  async getSession() {
    const client = getBrowserClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn("[supabase auth] failed to fetch session", error);
      return null;
    }
    return mapSupabaseSession(data.session);
  },
  async refreshSession() {
    const client = getBrowserClient();
    const { data, error } = await client.auth.refreshSession();
    if (error) {
      console.warn("[supabase auth] failed to refresh session", error);
      return null;
    }
    return mapSupabaseSession(data.session);
  },
  async signInWithPassword(payload) {
    const client = getBrowserClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) {
      throw new Error(error.message);
    }
    const session = mapSupabaseSession(data.session);
    if (!session) {
      throw new Error("Supabase did not return a session.");
    }
    return session;
  },
  async signInWithOtp(payload) {
    const client = getBrowserClient();
    const { error } = await client.auth.signInWithOtp({
      email: payload.email,
    });
    if (error) {
      throw new Error(error.message);
    }
  },
  async signUpWithPassword(payload) {
    const client = getBrowserClient();
    const { data, error } = await client.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          role: payload.role,
        },
      },
    });
    if (error) {
      throw new Error(error.message);
    }
    // If email confirmation is required, session may be null
    return mapSupabaseSession(data.session);
  },
  async signOut() {
    const client = getBrowserClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },
  onSessionChanged(callback) {
    const client = getBrowserClient();
    const { data } = client.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        callback(mapSupabaseSession(session));
        // Keep server-side session cookies in sync so SSR can read the session
        try {
          await fetch("/auth/callback", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ event, session }),
            keepalive: true,
          });
        } catch {
          // Non-blocking; server can still refresh on next request
        }
      }
    );
    return () => {
      data.subscription.unsubscribe();
    };
  },
};
