import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";
import { createClient } from "@supabase/supabase-js";
import { regionAdmins } from "@workspace/store/utils/nav";
import type { NotificationChannel } from "@workspace/store/types/notifications";

export type NotifyLevel = "info" | "success" | "warning" | "error";

export async function notifyUsers(args: {
  title: string;
  body?: string;
  level?: NotifyLevel;
  channel?: NotificationChannel;
  link?: string | null;
  sticky?: boolean;
  expiresAt?: string | null;
  recipients: string[];
}) {
  const env = ensureSupabaseEnv("server");
  if (!env.serviceRoleKey)
    return { ok: false, reason: "NO_SERVICE_KEY" } as const;
  if (!Array.isArray(args.recipients) || args.recipients.length === 0)
    return { ok: false, reason: "NO_RECIPIENTS" } as const;
  const admin = createClient(env.url, env.serviceRoleKey);
  const { error } = await admin.rpc("create_notification_for_users", {
    p_title: args.title,
    p_user_ids: args.recipients as any,
    p_body: args.body ?? "",
    p_level: args.level ?? "info",
    p_channel: args.channel ?? "system",
    p_link: args.link ?? null,
    p_sticky: Boolean(args.sticky),
    p_expires_at: args.expiresAt ?? null,
    p_meta: null,
  });
  if (error) return { ok: false, reason: error.message } as const;
  return { ok: true } as const;
}

export async function resolveRecipientsByRoles(args: {
  roles?: string[];
  groups?: ("dispatchers" | "admins" | "leaders")[];
  respectPrefs?: boolean;
  channel?: NotificationChannel;
}): Promise<string[]> {
  const env = ensureSupabaseEnv("server");
  if (!env.serviceRoleKey) return [];
  const admin = createClient(env.url, env.serviceRoleKey);

  const roleSet = new Set<string>();
  const groups = Array.isArray(args.groups) ? args.groups : [];
  for (const g of groups) {
    if (g === "dispatchers") {
      ["dispatcher_basic", "dispatcher_verified", "dispatcher_admin"].forEach(
        (r) => roleSet.add(r),
      );
    } else if (g === "admins") {
      ["dispatcher_admin", ...regionAdmins].forEach((r) => roleSet.add(r));
    } else if (g === "leaders") {
      ["pod_leader", "trainer"].forEach((r) => roleSet.add(r));
    }
  }
  const roles = Array.isArray(args.roles) ? args.roles.filter(Boolean) : [];
  roles.forEach((r) => roleSet.add(r));

  let profilesQuery = admin
    .from("profiles")
    .select("user_id, access_role")
    .not("user_id", "is", null);
  if (roleSet.size > 0) {
    profilesQuery = profilesQuery.in("access_role", Array.from(roleSet));
  }
  const { data, error } = await profilesQuery;
  if (error) return [];
  const allIds = (data ?? []).map((r: any) => r.user_id).filter(Boolean);
  if (allIds.length === 0) return [];

  if (args.respectPrefs === false) return allIds;

  try {
    const { data: prefRows } = await admin
      .from("notification_prefs")
      .select("user_id, global_opt_out, muted_channels")
      .in("user_id", allIds as any);
    const mutedByUser = new Map<
      string,
      { global_opt_out: boolean; muted_channels: string[] }
    >();
    for (const p of prefRows ?? []) {
      mutedByUser.set(p.user_id, {
        global_opt_out: Boolean(p.global_opt_out),
        muted_channels: Array.isArray(p.muted_channels) ? p.muted_channels : [],
      });
    }
    const channel = args.channel ?? "system";
    return allIds.filter((uid) => {
      const pref = mutedByUser.get(uid);
      if (!pref) return true;
      if (pref.global_opt_out) return false;
      if (pref.muted_channels?.includes(channel)) return false;
      return true;
    });
  } catch {
    return allIds;
  }
}

export async function resolveUserIdsFromProfileOrUserIds(
  ids: string[],
): Promise<string[]> {
  const env = ensureSupabaseEnv("server");
  if (!env.serviceRoleKey) return [];
  const admin = createClient(env.url, env.serviceRoleKey);
  const set = new Set<string>();
  if (ids.length === 0) return [];
  // Try by profiles.id
  try {
    const { data } = await admin
      .from("profiles")
      .select("user_id")
      .in("id", ids as any);
    for (const r of data ?? []) if (r.user_id) set.add(r.user_id);
  } catch (e) {
    console.warn("[notify] resolveUserIds: lookup by profiles.id failed", e);
  }
  // Try by profiles.user_id directly
  try {
    const { data } = await admin
      .from("profiles")
      .select("user_id")
      .in("user_id", ids as any);
    for (const r of data ?? []) if (r.user_id) set.add(r.user_id);
  } catch (e) {
    console.warn(
      "[notify] resolveUserIds: lookup by profiles.user_id failed",
      e,
    );
  }
  return Array.from(set);
}

export const ADMIN_GROUP_ROLES: string[] = [
  "dispatcher_admin",
  ...regionAdmins,
];
