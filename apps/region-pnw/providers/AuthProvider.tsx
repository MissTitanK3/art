"use client";

import * as React from "react";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import type {
  AuthProviderId,
  AuthSession,
  AuthStatus,
  OtpSignInPayload,
  PasswordSignInPayload,
  PasswordSignUpPayload,
} from "@/lib/auth/types";

type AuthContextValue = {
  providerId: AuthProviderId;
  session: AuthSession | null;
  user: AuthSession["user"] | null;
  status: AuthStatus;
  setSession: (session: AuthSession | null) => void;
  refresh: () => Promise<AuthSession | null>;
  signInWithPassword: (
    payload: PasswordSignInPayload
  ) => Promise<AuthSession>;
  signInWithOtp: (payload: OtpSignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithPassword: (
    payload: PasswordSignUpPayload
  ) => Promise<AuthSession | null>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

type AuthProviderProps = {
  initialSession?: AuthSession | null;
  children: React.ReactNode;
};

function toStatus(session: AuthSession | null): AuthStatus {
  return session ? "authenticated" : "unauthenticated";
}

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const providerId = React.useMemo<AuthProviderId>(() => "supabase", []);
  const supabaseRef = React.useRef<ReturnType<typeof getSupabaseBrowserClient> | null>(null);

  const [session, setSession] = React.useState<AuthSession | null>(
    initialSession
  );
  const [status, setStatus] = React.useState<AuthStatus>(
    toStatus(initialSession)
  );

  const ensureClient = React.useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = getSupabaseBrowserClient();
    }
    return supabaseRef.current;
  }, []);

  function mapSupabaseSession(s: SupabaseSession | null): AuthSession | null {
    if (!s) return null;
    const u = s.user;
    return {
      user: {
        id: u.id,
        email: u.email ?? "",
        role: ((u as any)?.user_metadata?.role ?? (u as any)?.role ?? "guest") as any,
        fullName: (u as any)?.user_metadata?.full_name ?? undefined,
        avatarUrl: (u as any)?.user_metadata?.avatar_url ?? undefined,
        metadata: (u as any)?.user_metadata ?? undefined,
      },
      accessToken: (s as any)?.access_token ?? "",
      refreshToken: (s as any)?.refresh_token ?? undefined,
      expiresAt: (s as any)?.expires_at ?? null,
      provider: "supabase",
    };
  }

  async function postAuthCallback(event: string, s: SupabaseSession | null) {
    try {
      await fetch("/auth/callback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event,
          session: s
            ? {
              access_token: (s as any)?.access_token ?? null,
              refresh_token: (s as any)?.refresh_token ?? null,
            }
            : null,
        }),
        cache: "no-store",
      });
    } catch {
      // Ignore network errors; SSR cookies can refresh later
    }
  }

  React.useEffect(() => {
    setSession(initialSession);
    setStatus(toStatus(initialSession));
  }, [initialSession]);

  React.useEffect(() => {
    let active = true;
    const supabase = ensureClient();

    async function hydrate() {
      if (initialSession) return; // already hydrated from server
      setStatus("loading");
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        console.warn("[AuthProvider] Failed to hydrate session", error);
        setSession(null);
        setStatus("unauthenticated");
        return;
      }
      const next = mapSupabaseSession(data.session);
      setSession(next);
      setStatus(toStatus(next));
    }

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      const next = mapSupabaseSession(s);
      setSession(next);
      setStatus(toStatus(next));
      // Keep server cookies in sync for SSR
      postAuthCallback(event, s);
    });

    return () => {
      active = false;
      try {
        sub.subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [ensureClient, initialSession]);

  const refresh = React.useCallback(async () => {
    setStatus("loading");
    const supabase = ensureClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setSession(null);
      setStatus("unauthenticated");
      throw error;
    }
    const next = mapSupabaseSession(data.session);
    setSession(next);
    setStatus(toStatus(next));
    return next;
  }, [ensureClient]);

  const signInWithPassword = React.useCallback(
    async (payload: PasswordSignInPayload) => {
      setStatus("loading");
      const supabase = ensureClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
      if (error) throw error;
      const next = mapSupabaseSession(data.session);
      setSession(next);
      setStatus(toStatus(next));
      // onAuthStateChange will also fire, but we return immediately
      return next as AuthSession;
    },
    [ensureClient]
  );

  const signInWithOtp = React.useCallback(
    async (payload: OtpSignInPayload) => {
      const supabase = ensureClient();
      const { error } = await supabase.auth.signInWithOtp({ email: payload.email });
      if (error) throw error;
    },
    [ensureClient]
  );

  const signUpWithPassword = React.useCallback(
    async (payload: PasswordSignUpPayload) => {
      const supabase = ensureClient();
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName,
            role: payload.role,
          },
        },
      });
      if (error) throw error;
      const next = mapSupabaseSession(data.session);
      if (next) {
        setSession(next);
        setStatus(toStatus(next));
      }
      return next;
    },
    [ensureClient]
  );

  const signOut = React.useCallback(async () => {
    const supabase = ensureClient();
    await supabase.auth.signOut();
    // onAuthStateChange will update state and trigger callback to sync cookies
  }, [ensureClient]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      providerId,
      session,
      user: session?.user ?? null,
      status,
      setSession,
      refresh,
      signInWithPassword,
      signInWithOtp,
      signOut,
      signUpWithPassword,
    }),
    [providerId, session, status, refresh, signInWithPassword, signInWithOtp, signOut, signUpWithPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
