// apps/region-pnw/lib/dal/admin.ts
import 'server-only';
import type { Profile, RegionSettings } from '@workspace/store/types/global.ts';
import type { Pod } from '@workspace/store/types/pod.ts';
import type { DispatchSubmission } from '@workspace/store/types/global.ts';
import { AccessRole, VerifiedBy } from '@workspace/store/types/roles.ts';
import { demoProfileAdapter } from '@/lib/adapters/profile/demoProfileAdapter';
import { demoPods, demoRoster } from '@/data/demoPods';
import { demoDispatches } from '@/data/demoDispatches';
import { TraingingSessionsDemoData } from '@/data/demoAcademy';
import type { TrustEntry, TrustRole } from '@workspace/store/types/trust.ts';
import { getAuthProviderId } from '@/lib/auth/adapter';
import { ensureSupabaseEnv } from '@/lib/auth/providers/supabase/common';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies as nextCookies } from 'next/headers';
import { requireServerSession } from '@/lib/auth/server';
import { regionAdmins } from '@workspace/store/utils/nav';

/**
 * Placeholder DAL for fetching a user's profile by auth user_id.
 * - When a real DB is wired, replace this with a query:
 *   SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
 */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const provider = getAuthProviderId();

  // Use Supabase on server when configured, so guards see the real profile
  if (provider === 'supabase') {
    try {
      const env = ensureSupabaseEnv('server');
      // Bridge cookies so the server-side Supabase client uses the caller's session
      const store = await nextCookies().catch(() => null as any);
      const client = createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            if (!store) return [] as { name: string; value: string }[];
            return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
          },
          setAll(cookies) {
            if (!store) return;
            try {
              cookies.forEach(({ name, value, options }) => {
                store.set(name, value, options as CookieOptions | undefined);
              });
            } catch {
              // In RSC, cookie store can be read-only; ignore.
            }
          },
        },
      });

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        // Prefer inserted_at for current schema; avoid joined_at
        .order('inserted_at', { ascending: false })
        .limit(1);
      if (error) {
        console.warn('[dal/admin] getProfileByUserId supabase error', error);
        return null;
      }
      const row = Array.isArray(data) ? data[0] : (data as any);
      return (row as Profile) ?? null;
    } catch (e) {
      console.warn('[dal/admin] getProfileByUserId supabase exception', e);
      return null;
    }
  }

  // DEMO provider: use in-memory fallback and link to user id for convenience
  const profile = await demoProfileAdapter.loadProfile(userId);
  if (!profile) return null;
  if (!profile.user_id || profile.user_id.length === 0) {
    profile.user_id = userId;
    await demoProfileAdapter.saveProfile(profile);
  }
  return profile as Profile;
}

// ---------- Admin DAL (demo-backed) ----------

export type ProfilesFilter = {
  access_role?: AccessRole;
  verified_by?: VerifiedBy;
  availability?: boolean;
};

export async function getProfiles(filter?: ProfilesFilter): Promise<Profile[]> {
  const provider = getAuthProviderId();
  console.log('[dal/admin] getProfiles using provider', provider);

  // Use Supabase when available to load registered users
  if (provider === 'supabase') {
    try {
      const env = ensureSupabaseEnv('server');
      // If we have a service role key and the caller is authorized, bypass RLS
      const serviceKey = env.serviceRoleKey;
      if (serviceKey) {
        try {
          const session = await requireServerSession();
          let authorized = regionAdmins.includes(session.user.role);
          if (!authorized) {
            const callerProfile = await getProfileByUserId(session.user.id);
            authorized = !!callerProfile && callerProfile.access_role === 'dispatcher_admin';
          }

          if (authorized) {
            const adminClient = createClient(env.url, serviceKey);
            let adminQuery = adminClient.from('profiles').select('*');
            if (filter?.access_role) adminQuery = adminQuery.eq('access_role', filter.access_role);
            if (filter?.verified_by) adminQuery = adminQuery.eq('verified_by', filter.verified_by);
            if (typeof filter?.availability === 'boolean') adminQuery = adminQuery.eq('availability', filter.availability);
            const { data, error } = await adminQuery;
            if (error) throw error;
            const rows = Array.isArray(data) ? data : [];
            return rows as unknown as Profile[];
          }
        } catch (e) {
          // If auth check fails (e.g., no session), fall back to scoped client below
          console.warn('[dal/admin] getProfiles service-role path unavailable, falling back to anon client', e);
        }
      }

      // Fallback: use anon client with caller session cookies (RLS may restrict to own profile)
      const store = await nextCookies().catch(() => null as any);
      const client = createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            if (!store) return [] as { name: string; value: string }[];
            return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
          },
          setAll(cookies) {
            if (!store) return;
            try {
              cookies.forEach(({ name, value, options }) => {
                store.set(name, value, options as CookieOptions | undefined);
              });
            } catch {}
          },
        },
      });

      let query = client.from('profiles').select('*');
      if (filter?.access_role) query = query.eq('access_role', filter.access_role);
      if (filter?.verified_by) query = query.eq('verified_by', filter.verified_by);
      if (typeof filter?.availability === 'boolean') query = query.eq('availability', filter.availability);
      const { data, error } = await query;
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      return rows as unknown as Profile[];
    } catch (e) {
      console.warn('[dal/admin] getProfiles supabase error', e);
      // Fall through to demo data if DB fails
    }
  }

  // Demo fallback: unique list from demo roster entries
  const map = new Map<string, Profile>();
  for (const entry of demoRoster) {
    const p = entry.profile as unknown as Profile;
    map.set(p.id, p);
  }
  let list = Array.from(map.values());
  if (filter?.access_role) list = list.filter((p) => p.access_role === filter.access_role);
  if (filter?.verified_by) list = list.filter((p) => p.verified_by === filter.verified_by);
  if (typeof filter?.availability === 'boolean') list = list.filter((p) => p.availability === filter.availability);
  return list;
}

export async function getPods(): Promise<Pod[]> {
  const provider = getAuthProviderId();
  if (provider === 'supabase') {
    try {
      const env = ensureSupabaseEnv('server');
      const store = await nextCookies().catch(() => null as any);
      const client = createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            if (!store) return [] as { name: string; value: string }[];
            return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
          },
          setAll(cookies) {
            if (!store) return;
            try {
              cookies.forEach(({ name, value, options }) => {
                store.set(name, value, options as CookieOptions | undefined);
              });
            } catch {}
          },
        },
      });
      const { data, error } = await client.from('pods').select('id, slug, name, area, channels');
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      return rows.map((row: any) => ({
        id: String(row.id),
        slug: String(row.slug),
        name: String(row.name ?? ''),
        area: String(row.area ?? ''),
        channels: Array.isArray(row.channels) ? row.channels : [],
        team: [],
      })) as Pod[];
    } catch (e) {
      console.warn('[dal/admin] getPods supabase error', e);
      return [];
    }
  }
  return demoPods as Pod[];
}

export type DispatchSummary = {
  total: number;
  active: number; // not archived/completed/cancelled/expired
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recent: DispatchSubmission[]; // latest few
};

export async function getDispatchSummary(limitRecent = 5): Promise<DispatchSummary> {
  const all = demoDispatches;
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const d of all) {
    byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    const t = d.type ?? 'other';
    byType[t] = (byType[t] ?? 0) + 1;
  }
  const total = all.length;
  const active = all.filter((d) => !['archived', 'completed', 'cancelled', 'expired'].includes(d.status)).length;
  const recent = [...all].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)).slice(0, limitRecent);
  return { total, active, byStatus, byType, recent };
}

export type AcademyStats = {
  totalActive: number; // non-archived
  completed: number;
  inProgress: number;
  scheduled: number;
  completionPct: number;
};

export async function getAcademyStats(): Promise<AcademyStats> {
  const all = TraingingSessionsDemoData.filter((s) => s.status !== 'archived');
  const completed = all.filter((s) => s.status === 'completed').length;
  const inProgress = all.filter((s) => s.status === 'in_progress').length;
  const scheduled = all.filter((s) => s.status === 'scheduled').length;
  const completionPct = all.length ? Math.round((completed / all.length) * 100) : 0;
  return { totalActive: all.length, completed, inProgress, scheduled, completionPct };
}

export type DbHealth = {
  schemaVersion: string;
  postgisOk: boolean;
  geogSyncOk: boolean;
  auditTriggersOk: boolean;
};

export async function runDbCheck(): Promise<DbHealth> {
  // Demo values. Replace with real queries to pg_catalog, information_schema, and extension checks.
  return {
    schemaVersion: '2025.10.24',
    postgisOk: true,
    geogSyncOk: true,
    auditTriggersOk: true,
  };
}

// ---------- Trust (demo) ----------

export async function getTrustEntries(): Promise<TrustEntry[]> {
  const provider = getAuthProviderId();
  if (provider === 'supabase') {
    try {
      const env = ensureSupabaseEnv('server');
      const store = await nextCookies().catch(() => null as any);
      const client = createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            if (!store) return [] as { name: string; value: string }[];
            return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
          },
          setAll(cookies) {
            if (!store) return;
            try {
              cookies.forEach(({ name, value, options }) => {
                store.set(name, value, options as CookieOptions | undefined);
              });
            } catch {}
          },
        },
      });
      const { data, error } = await client.from('trust_signatures').select('*');
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      return rows.map((r: any) => ({
        subjectId: String(r.subject_id),
        signerId: String(r.signer_id),
        signer_role: r.signer_role ?? 'pod_leader',
        signer_rot: r.signer_rot ?? '',
        signed_at: String(r.signed_at ?? new Date().toISOString()),
        signed_entry_hash: String(r.signed_entry_hash ?? ''),
        status: r.status ?? 'active',
      })) as TrustEntry[];
    } catch (e) {
      console.warn('[dal/admin] getTrustEntries supabase error', e);
      // fall through to demo
    }
  }

  // DEMO: generate trust edges from roster
  const edges: TrustEntry[] = [];
  for (const pod of demoPods) {
    const leads = pod.team.filter((r) => r.role === 'lead');
    const members = pod.team.filter((r) => r.role !== 'lead');
    for (const lead of leads) {
      for (const m of members) {
        edges.push({
          subjectId: m.profile.id,
          signerId: lead.profile.id,
          signer_role: 'pod_leader',
          signer_rot: 'demo-rot-fingerprint',
          signed_at: new Date().toISOString(),
          signed_entry_hash: `hash:${lead.profile.id.slice(0, 6)}-${m.profile.id.slice(0, 6)}`,
          status: 'active',
        });
      }
    }
  }

  return edges;
}

// ---------- Region Settings (demo) ----------

let DEMO_SETTINGS: RegionSettings = {
  regionLabel: 'ART Region Template',
  timezone: 'UTC',
  coordination_zone: 'sector-001',
  defaultDispatchRadiusKm: 10,
  cleanupIntervalsDays: 14,
  integrationSignalGroup: 'https://signal.group/#example-demo',
  federationEndpoint: 'https://federation.example.org/api',
  roleEscalationRules:
    '{\n  "promote": ["dispatcher_basic", "dispatcher_verified"],\n  "require": { "dispatcher_admin": ["verified_by:admin"] }\n}',
};

export async function getRegionSettings(): Promise<RegionSettings> {
  return DEMO_SETTINGS;
}

export async function updateRegionSettings(next: RegionSettings): Promise<void> {
  DEMO_SETTINGS = next;
}
