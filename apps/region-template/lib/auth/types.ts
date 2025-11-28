import type { NavRole } from "@workspace/store/utils/nav";

export type AuthProviderId = "supabase";

export type AuthUser = {
  id: string;
  email: string;
  role: NavRole;
  fullName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string | number | Date | null;
  provider?: AuthProviderId | string;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type PasswordSignInPayload = {
  email: string;
  password: string;
};

export type OtpSignInPayload = {
  email: string;
};

export type PasswordSignUpPayload = {
  email: string;
  password: string;
  fullName?: string;
  role?: NavRole;
};

export type AuthClientAdapter = {
  /** Fetch the latest session from the underlying client SDK. */
  getSession: () => Promise<AuthSession | null>;
  /** Optional manual refresh when tokens expire but you do not subscribe to changes. */
  refreshSession?: () => Promise<AuthSession | null>;
  /** Username/password sign-in flow. */
  signInWithPassword?: (payload: PasswordSignInPayload) => Promise<AuthSession>;
  /** Username/password sign-up flow. Returns a session if auto-confirm is enabled, otherwise null. */
  signUpWithPassword?: (
    payload: PasswordSignUpPayload,
  ) => Promise<AuthSession | null>;
  /** Passwordless magic-link or OTP flow. */
  signInWithOtp?: (payload: OtpSignInPayload) => Promise<void>;
  /** Sign the current user out. */
  signOut: () => Promise<void>;
  /** Subscribe to session changes emitted by the provider SDK. */
  onSessionChanged?: (
    callback: (session: AuthSession | null) => void,
  ) => () => void;
};

export type AdapterCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export type AdapterCookies = {
  getAll: () => AdapterCookie[];
  setAll?: (cookies: AdapterCookie[]) => void;
};

export type AuthServerContext = {
  cookies: AdapterCookies;
  headers?: Headers;
};

export type AuthServerAdapter = {
  getSession: () => Promise<AuthSession | null>;
  requireSession: () => Promise<AuthSession>;
  signOut?: () => Promise<void>;
};
