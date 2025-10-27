// apps/region-template/lib/dal/admin.ts
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

/**
 * Placeholder DAL for fetching a user's profile by auth user_id.
 * - When a real DB is wired, replace this with a query:
 *   SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
 */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  // DEMO fallback: single in-memory profile
  const profile = await demoProfileAdapter.loadProfile(userId);
  if (!profile) return null;

  // For demo usability, link the in-memory profile to the signed-in user
  if (!profile.user_id || profile.user_id.length === 0) {
    profile.user_id = userId;
    await demoProfileAdapter.saveProfile(profile);
  }

  // Demo convenience: ensure the profile appears fully verified and authorized
  // so users can explore all areas without additional steps.
  if (profile.verified_by === 'self' || !profile.verified_by) {
    profile.verified_by = 'admin' as any;
  }
  if (profile.access_role !== 'dispatcher_admin') {
    profile.access_role = 'dispatcher_admin' as any;
  }
  if (!profile.self_risk_acknowledged) {
    profile.self_risk_acknowledged = true as any;
  }
  if (profile.availability !== true) {
    profile.availability = true as any;
  }
  await demoProfileAdapter.saveProfile(profile);

  // If it doesn't match, still return the demo profile for now
  // Real implementation should strictly match userId
  return profile as Profile;
}

// ---------- Admin DAL (demo-backed) ----------

export type ProfilesFilter = {
  access_role?: AccessRole;
  verified_by?: VerifiedBy;
  availability?: boolean;
};

export async function getProfiles(filter?: ProfilesFilter): Promise<Profile[]> {
  // Build a unique list from demo roster entries
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
  // Generate demo trust edges: pod leads sign trust for members in same pod
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
