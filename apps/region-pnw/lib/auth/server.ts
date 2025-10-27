// apps/region-pnw/lib/auth/server.ts
import 'server-only';
import { cookies as nextCookies } from 'next/headers';
import { loadServerAdapter } from './server-adapter';
import { getAuthProviderId } from './adapter';
import type { AuthServerAdapter, AuthServerContext, AuthSession } from './types';
import { SESSION_COOKIE, decodeSession } from './providers/demo/common';

async function toAdapterCookies(): Promise<AuthServerContext | undefined> {
  try {
    const cookieStore = await nextCookies();
    return {
      cookies: {
        getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (cookies) => {
          // In Server Components, cookie mutations are disallowed; swallow safely.
          try {
            cookies.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options as any);
              } catch {
                // Ignore when not in a Route Handler/Server Action
              }
            });
          } catch {
            // No-op if the environment forbids mutations
          }
        },
      },
    };
  } catch {
    return undefined;
  }
}

async function getServerAdapter(context?: AuthServerContext): Promise<AuthServerAdapter> {
  const mergedContext = context ?? (await toAdapterCookies());
  return loadServerAdapter(mergedContext);
}

export async function getServerSession(context?: AuthServerContext): Promise<AuthSession | null> {
  // Only trust the demo cookie when the demo auth provider is active
  const provider = getAuthProviderId();
  if (provider === 'demo') {
    const cookieStore = await nextCookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    const session = decodeSession(raw);
    if (session) return session;
  }

  const server = await getServerAdapter(context);
  return server.getSession();
}

export async function requireServerSession(context?: AuthServerContext): Promise<AuthSession> {
  const session = await getServerSession(context);
  if (!session) throw new Error('AUTH_REQUIRED');
  return session;
}

export async function serverSignOut(context?: AuthServerContext) {
  const server = await getServerAdapter(context);
  await server.signOut?.();
}
