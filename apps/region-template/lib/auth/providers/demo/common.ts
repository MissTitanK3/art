import type { AuthSession } from "../../types";

export const SESSION_COOKIE = "region-template-session";
export const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const baseUser = {
  id: "demo-user-1",
  email: "coordinator@example.org",
  role: "national_admin" as const,
  fullName: "ART Demo Coordinator",
};

export function createDemoSession(email?: string): AuthSession {
  return {
    user: {
      ...baseUser,
      email: email ?? baseUser.email,
    },
    accessToken: "demo-access-token",
    refreshToken: "demo-refresh-token",
    expiresAt: Date.now() + ONE_WEEK_SECONDS * 1000,
    provider: "demo",
  };
}

export function encodeSession(session: AuthSession): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSession(raw: string | undefined | null): AuthSession | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    if (!parsed?.user) return null;
    return {
      ...parsed,
      provider: "demo",
    } as AuthSession;
  } catch (error) {
    console.warn("[demo auth] failed to parse session cookie", error);
    return null;
  }
}
