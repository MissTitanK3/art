import type { AuthClientAdapter, AuthSession } from "../../types";
import {
  ONE_WEEK_SECONDS,
  SESSION_COOKIE,
  createDemoSession,
  decodeSession,
  encodeSession,
} from "./common";

function readSessionFromCookie(): AuthSession | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const value = cookie.split("=").slice(1).join("=");
  return decodeSession(value);
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
