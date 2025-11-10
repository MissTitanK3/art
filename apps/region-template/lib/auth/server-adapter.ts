import "server-only";
import { getAuthProviderId } from "./adapter";
import type { AuthServerAdapter, AuthServerContext } from "./types";

export async function loadServerAdapter(
  context?: AuthServerContext,
): Promise<AuthServerAdapter> {
  const provider = getAuthProviderId();
  switch (provider) {
    case "supabase": {
      const module = await import("./providers/supabase/server");
      return module.createSupabaseServerAdapter(context);
    }
    case "demo":
    default: {
      const module = await import("./providers/demo/server");
      return module.createDemoServerAdapter(context);
    }
  }
}
