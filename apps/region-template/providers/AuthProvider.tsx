"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  signInWithPassword: (payload: PasswordSignInPayload) => Promise<AuthSession>;
  signInWithOtp: (payload: OtpSignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithPassword: (
    payload: PasswordSignUpPayload
  ) => Promise<AuthSession | null>;
  /** Send a password reset email. */
  requestPasswordReset: (email: string, redirectTo?: string) => Promise<void>;
  /** Complete a password reset for the current recovery session. */
  updatePassword: (newPassword: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
type AuthProviderProps = {
  initialSession?: AuthSession | null;
  children: React.ReactNode;
};
function toStatus(session: AuthSession | null): AuthStatus {
  return session ? "authenticated" : "unauthenticated";
}
export function AuthProvider({
  children,
  initialSession = null,
}: AuthProviderProps) {
  const providerId = useMemo<AuthProviderId>(() => "supabase", []);
  const supabaseRef = useRef<ReturnType<
    typeof getSupabaseBrowserClient
  > | null>(null);
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [status, setStatus] = useState<AuthStatus>(toStatus(initialSession));
  const ensureClient = useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = getSupabaseBrowserClient();
    }
    return supabaseRef.current;
  }, []);
  function mapSupabaseSession(
    s: SupabaseSession | null,
    uInput?: {
      id: string;
      email?: string;
      app_metadata: any;
      user_metadata: any;
    } | null
  ): AuthSession | null {
    if (!s) return null;
    const u = uInput ?? s.user;
    return {
      user: {
        id: u.id,
        email: u.email ?? "",
        role: ((u as any)?.user_metadata?.role ??
          (u as any)?.role ??
          "guest") as any,
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
  useEffect(() => {
    setSession(initialSession);
    setStatus(toStatus(initialSession));
  }, [initialSession]);
  useEffect(() => {
    let active = true;
    const supabase = ensureClient();
    async function hydrate() {
      if (initialSession) return;
      setStatus("loading");

      const [{ data: sessionData, error: sessionError }, { data: userData }] =
        await Promise.all([
          supabase.auth.getSession(),
          supabase.auth.getUser(),
        ]);

      if (!active) return;
      if (sessionError) {
        console.warn("[AuthProvider] Failed to hydrate session", sessionError);
        setSession(null);
        setStatus("unauthenticated");
        return;
      }
      const next = mapSupabaseSession(sessionData.session, userData.user);
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
  const refresh = useCallback(async () => {
    setStatus("loading");
    const supabase = ensureClient();
    const [{ data: sessionData, error: sessionError }, { data: userData }] =
      await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);
    if (sessionError) {
      setSession(null);
      setStatus("unauthenticated");
      throw sessionError;
    }
    const next = mapSupabaseSession(sessionData.session, userData.user);
    setSession(next);
    setStatus(toStatus(next));
    return next;
  }, [ensureClient]);
  const signInWithPassword = useCallback(
    async (payload: PasswordSignInPayload) => {
      setStatus("loading");
      const supabase = ensureClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
      if (error) throw error;
      const next = mapSupabaseSession(data.session, data.user);
      setSession(next);
      setStatus(toStatus(next));
      // onAuthStateChange will also fire, but we return immediately
      return next as AuthSession;
    },
    [ensureClient]
  );
  const signInWithOtp = useCallback(
    async (payload: OtpSignInPayload) => {
      const supabase = ensureClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: payload.email,
      });
      if (error) throw error;
    },
    [ensureClient]
  );
  const signUpWithPassword = useCallback(
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
      const next = mapSupabaseSession(data.session, data.user);
      if (next) {
        setSession(next);
        setStatus(toStatus(next));
      }
      return next;
    },
    [ensureClient]
  );
  const requestPasswordReset = useCallback(
    async (email: string, redirectTo?: string) => {
      const supabase = ensureClient();
      const url = (() => {
        if (redirectTo) return redirectTo;
        const base = process.env.NEXT_PUBLIC_SITE_URL;
        if (base) return `${base.replace(/\/$/, "")}/auth/reset-password`;
        if (typeof window !== "undefined")
          return `${window.location.origin}/auth/reset-password`;
        return undefined;
      })();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: url,
      });
      if (error) throw error;
    },
    [ensureClient]
  );
  const updatePassword = useCallback(
    async (newPassword: string) => {
      const supabase = ensureClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      try {
        const [{ data: sessionData }, { data: userData }] = await Promise.all([
          supabase.auth.getSession(),
          supabase.auth.getUser(),
        ]);
        await postAuthCallback(
          "USER_UPDATED",
          sessionData.session as unknown as SupabaseSession
        );
        const next = mapSupabaseSession(sessionData.session, userData.user);
        setSession(next);
        setStatus(toStatus(next));
      } catch {
        // ignore
      }
    },
    [ensureClient]
  );
  const signOut = useCallback(async () => {
    const supabase = ensureClient();
    await supabase.auth.signOut();
    // onAuthStateChange will update state and trigger callback to sync cookies
  }, [ensureClient]);
  const value = useMemo<AuthContextValue>(
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
      requestPasswordReset,
      updatePassword,
    }),
    [
      providerId,
      session,
      status,
      refresh,
      signInWithPassword,
      signInWithOtp,
      signOut,
      signUpWithPassword,
      requestPasswordReset,
      updatePassword,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
