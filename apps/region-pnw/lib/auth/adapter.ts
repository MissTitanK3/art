import type { AuthClientAdapter, AuthProviderId } from "./types";

function isAuthProviderId(value: string): value is AuthProviderId {
  return value === "demo" || value === "supabase";
}

const rawProvider =
  process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? process.env.AUTH_PROVIDER ?? "demo";

const providerId: AuthProviderId = isAuthProviderId(rawProvider)
  ? rawProvider
  : "demo";

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
