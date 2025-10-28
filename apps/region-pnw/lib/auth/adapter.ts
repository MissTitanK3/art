import type { AuthClientAdapter, AuthProviderId } from "./types";

function isAuthProviderId(value: string | undefined | null): value is AuthProviderId {
  return value === "demo" || value === "supabase";
}

// IMPORTANT: Use ONLY the public env var for both client and server to avoid
// mismatches where the browser defaults to "demo" but the server uses AUTH_PROVIDER.
// If unset or invalid, default to "demo".
const publicProvider = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
const providerId: AuthProviderId = isAuthProviderId(publicProvider) ? publicProvider : "demo";

// (Optional) surface a warning server-side if AUTH_PROVIDER is set but differs
// from NEXT_PUBLIC_AUTH_PROVIDER, since that can cause redirect loops.
if (typeof window === "undefined") {
  const serverOnly = process.env.AUTH_PROVIDER;
  if (serverOnly && serverOnly !== publicProvider) {
    // eslint-disable-next-line no-console
    console.warn(
      `[auth] AUTH_PROVIDER (${serverOnly}) differs from NEXT_PUBLIC_AUTH_PROVIDER (${publicProvider ?? "<unset>"}). ` +
        `Using NEXT_PUBLIC_AUTH_PROVIDER to keep client/server consistent.`
    );
  }
}

export function getAuthProviderId(): AuthProviderId {
  return providerId;
}

let clientAdapterPromise: Promise<AuthClientAdapter> | null = null;

export async function loadClientAdapter(): Promise<AuthClientAdapter> {
  if (!clientAdapterPromise) {
    clientAdapterPromise = (async () => {
      switch (providerId) {
        case "supabase": {
          const module = await import("./providers/supabase/client");
          return module.supabaseClientAdapter;
        }
        case "demo":
        default: {
          const module = await import("./providers/demo/client");
          return module.demoClientAdapter;
        }
      }
    })();
  }
  return clientAdapterPromise;
}
