import "server-only";
import { cookies as nextCookies } from "next/headers";
import type {
  AdapterCookie,
  AuthServerAdapter,
  AuthServerContext,
} from "../../types";
import { SESSION_COOKIE, decodeSession } from "./common";

function readCookieFromContext(
  context: AuthServerContext | undefined
): string | undefined {
  if (!context?.cookies) return undefined;
  const match = context.cookies
    .getAll()
    .find((cookie: AdapterCookie) => cookie.name === SESSION_COOKIE);
  return match?.value;
}

async function readCookieFromNext(): Promise<string | undefined> {
  try {
    const store = await nextCookies();
    return store.get(SESSION_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

async function clearCookie(context?: AuthServerContext) {
  try {
    const store = await nextCookies();
    store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  } catch {
    // ignore when running inside a Server Component where cookies are readonly
  }

  context?.cookies.setAll?.([
    { name: SESSION_COOKIE, value: "", options: { maxAge: 0, path: "/" } },
  ]);
}

export async function createDemoServerAdapter(
  context?: AuthServerContext
): Promise<AuthServerAdapter> {
  const cookieValue =
    readCookieFromContext(context) ?? (await readCookieFromNext());
  let session = decodeSession(cookieValue);

  // Invalidate expired demo sessions and clear the cookie to avoid redirect loops
  if (session?.expiresAt) {
    const expiresAtMs =
      typeof session.expiresAt === "number"
        ? session.expiresAt
        : typeof session.expiresAt === "string"
        ? Date.parse(session.expiresAt)
        : session.expiresAt instanceof Date
        ? session.expiresAt.getTime()
        : undefined;

    if (typeof expiresAtMs === "number" && !Number.isNaN(expiresAtMs)) {
      if (Date.now() > expiresAtMs) {
        await clearCookie(context);
        session = null;
      }
    }
  }

  return {
    async getSession() {
      return session;
    },
    async requireSession() {
      if (!session) {
        throw new Error("AUTH_REQUIRED");
      }
      return session;
    },
    async signOut() {
      await clearCookie(context);
    },
  };
}
