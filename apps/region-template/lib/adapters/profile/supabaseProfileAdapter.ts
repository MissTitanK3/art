// apps/region-template/lib/adapters/profile/supabaseProfileAdapter.ts
"use client";

import type { Profile } from "@workspace/store/types/global.ts";
import type { ProfileAdapter } from "@workspace/store/types/profile.ts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function isUuid(value: string): boolean {
  return /^(\{)?[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[1-5][0-9a-fA-F]{3}\-[89abAB][0-9a-fA-F]{3}\-[0-9a-fA-F]{12}(\})?$/.test(
    value,
  );
}

export const supabaseProfileAdapter: ProfileAdapter = {
  async loadProfile(userId: string): Promise<Profile | null> {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .limit(1);
    if (error) {
      console.warn("[supabaseProfileAdapter] loadProfile error", error);
      return null;
    }
    const row = Array.isArray(data) ? (data[0] as any) : (data as any);
    if (!row) return null;
    return {
      ...row,
    } as Profile;
  },
  async saveProfile(profile: Profile): Promise<void> {
    const client = getSupabaseBrowserClient();
    const { inserted_at, ...rest } = profile as any;
    const payload = { ...rest, inserted_at };
    const { error } = await client.from("profiles").upsert(payload);
    if (error) {
      throw new Error(error.message);
    }
  },
  async deleteProfile(userOrProfileId: string): Promise<void> {
    const client = getSupabaseBrowserClient();
    const target = isUuid(userOrProfileId) ? userOrProfileId : userOrProfileId;
    const { error: byIdErr } = await client
      .from("profiles")
      .delete()
      .or(`id.eq.${target},user_id.eq.${target}`);
    if (byIdErr) {
      throw new Error(byIdErr.message);
    }
  },
};
