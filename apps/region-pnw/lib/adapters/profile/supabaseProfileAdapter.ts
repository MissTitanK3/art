// apps/region-pnw/lib/adapters/profile/supabaseProfileAdapter.ts
'use client';

import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import type { Profile } from '@workspace/store/types/global.ts';
import type { ProfileAdapter } from '@workspace/store/types/profile.ts';

function isUuid(value: string): boolean {
  return /^(\{)?[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[1-5][0-9a-fA-F]{3}\-[89abAB][0-9a-fA-F]{3}\-[0-9a-fA-F]{12}(\})?$/.test(
    value,
  );
}

export const supabaseProfileAdapter: ProfileAdapter = {
  async loadProfile(userId: string): Promise<Profile | null> {
    const client = getSupabaseBrowserClient();
    // Prefer lookup by user_id to match auth linkage, but be resilient:
    // - handle rows returned as arrays
    // - allow lookup by id or user_id
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .limit(1);
    if (error) {
      console.warn('[supabaseProfileAdapter] loadProfile error', error);
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
    // Map store -> DB type (inserted_at -> joined_at)
    const { inserted_at, ...rest } = profile as any;
    // Write both joined_at and inserted_at for schema compatibility
    const payload = { ...rest, inserted_at };
    const { error } = await client.from('profiles').upsert(payload);
    if (error) {
      throw new Error(error.message);
    }
  },
  async deleteProfile(userOrProfileId: string): Promise<void> {
    const client = getSupabaseBrowserClient();
    // Be flexible: try delete by id OR user_id
    const target = isUuid(userOrProfileId) ? userOrProfileId : userOrProfileId;
    const { error: byIdErr } = await client.from('profiles').delete().or(`id.eq.${target},user_id.eq.${target}`);
    if (byIdErr) {
      throw new Error(byIdErr.message);
    }
  },
};
