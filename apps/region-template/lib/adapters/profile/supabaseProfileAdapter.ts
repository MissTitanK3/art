"use client";

import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type { Profile } from "@workspace/store/types/global.ts";
import type { ProfileAdapter } from "@workspace/store/types/profile.ts";

function isUuid(value: string): boolean {
  // Allow optional surrounding braces and standard UUID hyphenation
  return /^(\{)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}(\})?$/.test(
    value,
  );
}

export const supabaseProfileAdapter: ProfileAdapter = {
  async loadProfile(userId: string): Promise<Profile | null> {
    const client = getSupabaseBrowserClient();
    const lookupIds = new Set<string>();
    lookupIds.add(userId);
    if (!isUuid(userId)) {
      try {
        const { data: authData } = await client.auth.getUser();
        const supabaseId = authData?.user?.id;
        if (supabaseId) lookupIds.add(supabaseId);
      } catch {
        // best-effort only
      }
    }
    const idsArray = Array.from(lookupIds);
    // Prefer lookup by user_id to match auth linkage, but be resilient:
    // - handle rows returned as arrays
    // - allow lookup by id or user_id
    const orClause = `user_id.in.(${idsArray.join(
      ",",
    )}),id.in.(${idsArray.join(",")})`;
    const { data, error } = await client.from("profiles").select("*").or(orClause).limit(1);
    if (error) {
      console.warn("[supabaseProfileAdapter] loadProfile error", error);
      return null;
    }
    const row = Array.isArray(data) ? (data[0] as any) : (data as any);
    if (!row) return null;
    // Normalize nullable fields to avoid runtime null reads
    const normalized: Profile = {
      ...(row as any),
      last_profile_check_in: (row as any)?.last_profile_check_in ?? null,
      display_name: String((row as any)?.display_name ?? ""),
    } as Profile;
    return normalized;
  },
  async saveProfile(profile: Profile): Promise<void> {
    const client = getSupabaseBrowserClient();
    // Map store -> DB type (inserted_at -> joined_at)
    const { inserted_at, ...rest } = profile as any;
    // Write both joined_at and inserted_at for schema compatibility
    const payload = { ...rest, inserted_at };
    const { error } = await client.from("profiles").upsert(payload);
    if (error) {
      throw new Error(error.message);
    }
  },
  async deleteProfile(userOrProfileId: string): Promise<void> {
    const client = getSupabaseBrowserClient();
    // Be flexible: try delete by id OR user_id
    const target = userOrProfileId;
    const { error: byIdErr } = await client
      .from("profiles")
      .delete()
      .or(`id.eq.${target},user_id.eq.${target}`);
    if (byIdErr) {
      throw new Error(byIdErr.message);
    }
  },
};
