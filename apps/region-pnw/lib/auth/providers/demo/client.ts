import type { AuthClientAdapter, AuthSession } from "../../types";
import {
  ONE_WEEK_SECONDS,
  SESSION_COOKIE,
  createDemoSession,
  decodeSession,
  encodeSession,
} from "./common";

function isExpired(session: AuthSession | null): boolean {
  if (!session?.expiresAt) return false;
  const expiresAtMs =
    typeof session.expiresAt === "number"
      ? session.expiresAt
      : typeof session.expiresAt === "string"
      ? Date.parse(session.expiresAt)
      : session.expiresAt instanceof Date
      ? session.expiresAt.getTime()
      : undefined;
  return typeof expiresAtMs === "number" && !Number.isNaN(expiresAtMs)
    ? Date.now() > expiresAtMs
    : false;
}

function readSessionFromCookie(): AuthSession | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const value = cookie.split("=").slice(1).join("=");
  const session = decodeSession(value);
  if (isExpired(session)) {
    // Proactively clear stale cookie to avoid redirect loops
    persistSession(null);
    return null;
  }
  return session;
}

function persistSession(session: AuthSession | null) {
  if (typeof document === "undefined") return;
  if (session) {
    const encoded = encodeSession(session);
    document.cookie = `${SESSION_COOKIE}=${encoded}; path=/; max-age=${ONE_WEEK_SECONDS}; SameSite=Lax`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export const demoClientAdapter: AuthClientAdapter = {
  async getSession() {
    return readSessionFromCookie();
  },
  async signInWithPassword(payload) {
    const session = createDemoSession(payload.email);
    persistSession(session);
    return session;
  },
  async signOut() {
    persistSession(null);
  },
  onSessionChanged(callback) {
    if (typeof window === "undefined") return () => {};

    const onFocus = () => callback(readSessionFromCookie());
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_COOKIE) {
        callback(readSessionFromCookie());
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  },
};
