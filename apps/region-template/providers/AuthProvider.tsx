"use client";

import * as React from "react";
import { getAuthClient } from "@/lib/auth/client";
import { getAuthProviderId } from "@/lib/auth/adapter";
import type {
  AuthProviderId,
  AuthSession,
  AuthStatus,
  OtpSignInPayload,
  PasswordSignInPayload,
} from "@/lib/auth/types";
import type { AuthClientAdapter } from "@/lib/auth/types";

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
  const providerId = React.useMemo(() => getAuthProviderId(), []);
  const clientRef = React.useRef<AuthClientAdapter | null>(null);

  const [session, setSession] = React.useState<AuthSession | null>(
    initialSession
  );
  const [status, setStatus] = React.useState<AuthStatus>(
    toStatus(initialSession)
  );

  const ensureClient = React.useCallback(async () => {
    if (!clientRef.current) {
      clientRef.current = await getAuthClient();
    }
    return clientRef.current;
  }, []);

  React.useEffect(() => {
    setSession(initialSession);
    setStatus(toStatus(initialSession));
  }, [initialSession]);

  React.useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    ensureClient().then(async (client) => {
      if (!active) return;

      if (!initialSession) {
        setStatus("loading");
        try {
          const next = await client.getSession();
          if (!active) return;
          setSession(next);
          setStatus(toStatus(next));
        } catch (error) {
          console.warn("[AuthProvider] Failed to hydrate session", error);
          if (!active) return;
          setSession(null);
          setStatus("unauthenticated");
        }
      }

      if (client.onSessionChanged) {
        unsubscribe = client.onSessionChanged((next) => {
          if (!active) return;
          setSession(next);
          setStatus(toStatus(next));
        });
      }
    });

    return () => {
      active = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [ensureClient, initialSession]);

  const refresh = React.useCallback(async () => {
    setStatus("loading");
    const client = await ensureClient();
    try {
      const next =
        (await client.refreshSession?.()) ?? (await client.getSession());
      setSession(next);
      setStatus(toStatus(next));
      return next;
    } catch (error) {
      setSession(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, [ensureClient]);

  const signInWithPassword = React.useCallback(
    async (payload: PasswordSignInPayload) => {
      setStatus("loading");
      const client = await ensureClient();
      if (!client.signInWithPassword) {
        throw new Error(
          `${providerId} adapter does not support password sign-in`
        );
      }
      const next = await client.signInWithPassword(payload);
      setSession(next);
      setStatus(toStatus(next));
      return next;
    },
    [ensureClient, providerId]
  );

  const signInWithOtp = React.useCallback(
    async (payload: OtpSignInPayload) => {
      const client = await ensureClient();
      if (!client.signInWithOtp) {
        throw new Error(
          `${providerId} adapter does not support magic-link sign-in`
        );
      }
      await client.signInWithOtp(payload);
    },
    [ensureClient, providerId]
  );

  const signOut = React.useCallback(async () => {
    const client = await ensureClient();
    await client.signOut();
    setSession(null);
    setStatus("unauthenticated");
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
    }),
    [providerId, session, status, refresh, signInWithPassword, signInWithOtp, signOut]
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
