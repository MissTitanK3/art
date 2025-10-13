import { DispatchSubmission, Profile } from '../types/global.ts';
import { NormalizedLanguage } from '../types/language.ts';
import { NormalizedCertification, RosterEntry } from '../types/pod.ts';
import { FieldRole } from '../types/roles.ts';

export function makeDispatchSubmission(overrides: Partial<DispatchSubmission> = {}): DispatchSubmission {
  return {
    id: crypto.randomUUID(), // or fakeUUID if you prefer
    timestamp: new Date().toISOString(),
    source: 'dispatch',
    visibility_radius_km: 10,
    status: 'unconfirmed',
    training: false,
    logistics: [],
    ...overrides,
  };
}

export const makeProfile = (id: string, display: string, role: FieldRole[], affiliation?: string): Profile => ({
  id,
  user_id: `user-${id}`,
  display_name: display,
  access_role: 'team_member',
  field_roles: role,
  verified_by: 'self',
  affiliation,
  availability: true,
  contact_signal: `${display.toLowerCase().replace(/\s+/g, '_')}@signal`,
  coordination_zone: 'zone-1',
  inserted_at: new Date().toISOString(),
  coverage_zones: ['06001'],
  state: 'active',
  self_risk_acknowledged: true,
  operating_counties: ['06001'],
});

export const makeRosterEntry = (
  id: string,
  profile: Profile,
  role: 'lead' | 'member' | 'trainee',
  status: 'active' | 'inactive' | 'suspended',
  langs: NormalizedLanguage[],
  skills: string[],
  fieldRoles: FieldRole[],
  certs: NormalizedCertification[] = [],
  lastShiftAt?: string,
  notes?: string,
): RosterEntry => ({
  id,
  volunteer: profile,
  role,
  status,
  langs,
  skills,
  fieldRoles,
  handle: profile.display_name.toLowerCase().replace(/\s+/g, '-'),
  joinedAt: new Date().toISOString(),
  certs,
  lastShiftAt,
  notes,
});
