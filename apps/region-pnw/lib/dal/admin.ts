// apps/region-pnw/lib/dal/admin.ts
import 'server-only';
import type { Profile, RegionSettings } from '@workspace/store/types/global.ts';
import type { Pod } from '@workspace/store/types/pod.ts';
import type { DispatchSubmission } from '@workspace/store/types/global.ts';
import { AccessRole, VerifiedBy } from '@workspace/store/types/roles.ts';
import { TraingingSessionsDemoData } from '@/data/demoAcademy';
import type { TrustEntry, TrustRole } from '@workspace/store/types/trust.ts';
import { createClient } from '@supabase/supabase-js';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '../auth/supabase/utils';
import { createSupabaseServerClient } from '../auth/supabase/server';

/**
 * Placeholder DAL for fetching a user's profile by auth user_id.
 * - When a real DB is wired, replace this with a query:
 *   SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
 */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const client = await createSupabaseServerClient();

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

// ---------- Admin DAL (demo-backed) ----------

export type ProfilesFilter = {
  access_role?: AccessRole;
  verified_by?: VerifiedBy;
  availability?: boolean;
};

export async function getProfiles(filter?: ProfilesFilter): Promise<Profile[]> {
  try {
    const env = ensureSupabaseEnv('server');
    // If we have a service role key and the caller is authorized, bypass RLS
    const serviceKey = env.serviceRoleKey;
    if (serviceKey) {
      try {
        // Use the new server helper to get the current user
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const user = userData?.user;
        let authorized = false;
        if (user) {
          // Admin allowlist aligned with /admin route access: dispatcher_admin + regionAdmins
          const ADMIN_ALLOW = new Set<AccessRole>(['dispatcher_admin', ...(regionAdmins as unknown as AccessRole[])]);

          // Some deployments may store a nav role on the user; trust it if in allowlist.
          const navRole = (user as any)?.role as AccessRole | undefined;
          authorized = !!navRole && ADMIN_ALLOW.has(navRole);

          // Fall back to profile role check if needed
          if (!authorized) {
            const callerProfile = await getProfileByUserId(user.id);
            authorized = !!callerProfile && ADMIN_ALLOW.has(callerProfile.access_role as AccessRole);
          }
        }

        if (authorized) {
          const adminClient = createClient(env.url, serviceKey);
          let adminQuery = adminClient.from('profiles').select('*');
          if (filter?.access_role) adminQuery = adminQuery.eq('access_role', filter.access_role);
          if (filter?.verified_by) adminQuery = adminQuery.eq('verified_by', filter.verified_by);
          if (typeof filter?.availability === 'boolean')
            adminQuery = adminQuery.eq('availability', filter.availability);
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
    const client = await createSupabaseServerClient();

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
    return [];
  }
}

export async function getPods(): Promise<Pod[]> {
  try {
    const client = await createSupabaseServerClient();
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

export type DispatchSummary = {
  total: number;
  active: number; // not archived/completed/cancelled/expired
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recent: DispatchSubmission[]; // latest few
};

export async function getDispatchSummary(limitRecent = 5): Promise<DispatchSummary> {
  try {
    const env = ensureSupabaseEnv('server');
    const serviceKey = env.serviceRoleKey;
    if (serviceKey) {
      // Prefer service role for aggregate summary across all rows
      const adminClient = createClient(env.url, serviceKey);
      const { data, error } = await adminClient
        .from('dispatch_submissions')
        .select('id, status, type, timestamp')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      const rows = (Array.isArray(data) ? data : []) as DispatchSubmission[];
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};
      for (const d of rows) {
        byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
        const t = (d as any).type ?? 'other';
        byType[t] = (byType[t] ?? 0) + 1;
      }
      const total = rows.length;
      const active = rows.filter((d) => !['archived', 'completed', 'cancelled', 'expired'].includes(d.status)).length;
      const recent = rows.slice(0, Math.max(0, limitRecent));
      return { total, active, byStatus, byType, recent };
    }

    // Fallback to anon-scoped client (may be empty due to RLS)
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from('dispatch_submissions')
      .select('id, status, type, timestamp')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    const rows = (Array.isArray(data) ? data : []) as DispatchSubmission[];
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const d of rows) {
      byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
      const t = (d as any).type ?? 'other';
      byType[t] = (byType[t] ?? 0) + 1;
    }
    const total = rows.length;
    const active = rows.filter((d) => !['archived', 'completed', 'cancelled', 'expired'].includes(d.status)).length;
    const recent = rows.slice(0, Math.max(0, limitRecent));
    return { total, active, byStatus, byType, recent };
  } catch (e) {
    console.warn('[dal/admin] getDispatchSummary supabase error', e);
    return { total: 0, active: 0, byStatus: {}, byType: {}, recent: [] };
  }
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
  try {
    const client = await createSupabaseServerClient();
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
    return [];
  }
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
