import type { Session } from "@supabase/supabase-js";
import type { AuthSession, AuthUser } from "../../types";
import type { NavRole } from "@workspace/store/utils/nav";

export type SupabaseEnv = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export function ensureSupabaseEnv(
  source: "client" | "server" | "wizard",
): SupabaseEnv {
  const useWizard = source === "wizard";
  const url = useWizard
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_WIZZARD ??
      process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = useWizard
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WIZZARD ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      `[supabase auth] Missing environment configuration for ${source}. Expected NEXT_PUBLIC_SUPABASE_URL_WIZZARD / NEXT_PUBLIC_SUPABASE_ANON_KEY_WIZZARD or defaults.`,
    );
  }

  return {
    url,
    anonKey,
    serviceRoleKey: useWizard
      ? process.env.SUPABASE_SERVICE_ROLE_KEY_WIZZARD ??
        process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function coerceNavRole(value: unknown): NavRole {
  switch (value) {
    // Known, valid NavRole values
    case "team_member":
    case "pod_leader":
    case "trainer":
    case "dispatcher_basic":
    case "dispatcher_verified":
    case "dispatcher_admin":
    case "admin":
    case "regional_admin":
    case "national_admin":
      return value as NavRole;
    // Legacy or external synonyms – map to the closest valid role
    case "guest":
    case "user":
    case "volunteer":
    case "member":
    case "basic":
      return "team_member";
    default:
      return "team_member";
  }
}

export function mapSupabaseSession(
  session: Session | null,
): AuthSession | null {
  if (!session?.user) return null;

  const metadata = session.user.user_metadata ?? {};
  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email ?? "",
    role: coerceNavRole(metadata.role),
    fullName: metadata.full_name ?? metadata.name ?? undefined,
    avatarUrl: metadata.avatar_url ?? undefined,
    metadata,
  };

  return {
    user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token ?? undefined,
    expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
    provider: "supabase",
  };
}
