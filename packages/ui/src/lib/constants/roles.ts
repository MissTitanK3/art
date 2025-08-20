// Role types (used throughout the app)
export const AccessRoles = ['team_member', 'dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin'] as const;
export type AccessRole = (typeof AccessRoles)[number];

export const VerifiedBy = ['self', 'partner_org', 'admin'] as const;
export type VerifiedBy = (typeof VerifiedBy)[number];

// Descriptions for tooltips or help text
export const AccessRoleDescriptions: Record<AccessRole, string> = {
  team_member: 'Team members can view and respond to field tasks, but do not have dispatch privileges.',
  dispatcher_basic: 'Basic dispatchers can coordinate with field teams but cannot manage team members.',
  dispatcher_verified: 'Verified dispatchers are trusted coordinators with elevated permissions.',
  dispatcher_admin: 'Admins can fully manage dispatch operations, teams, and settings.',
};

export const VerifiedByDescriptions: Record<VerifiedBy, string> = {
  self: 'This user verified themselves during signup.',
  partner_org: 'Verified through a trusted partner organization.',
  admin: 'Verified directly by a system admin.',
};

// NEW: Field roles (single source of truth)
export const FIELD_ROLE_OPTIONS = [
  'translator',
  'asl_interpreter',
  'medic',
  'mental_health',
  'disability_aid',
  'legal',
  'arrest_tracker',
  'rights_observer',
  'media_observer',
  'deescalation',
  'safety_marshall',
  'defensive',
  'dispatch_aide',
  'tech_support',
  'logistics',
  'child_specialist',
  'immigration_specialist',
  'faith_leader',
  'bondsman',
  'social_worker',
  'line_scheduler',
] as const;

export type FieldRole = (typeof FIELD_ROLE_OPTIONS)[number];

// Label helpers
export function roleLabel(role: AccessRole): string {
  switch (role) {
    case 'team_member':
      return 'Team Member';
    case 'dispatcher_basic':
      return 'Dispatcher (Basic)';
    case 'dispatcher_verified':
      return 'Dispatcher (Verified)';
    case 'dispatcher_admin':
      return 'Dispatcher Admin';
  }
}

export function verifierLabel(source: VerifiedBy): string {
  switch (source) {
    case 'self':
      return 'Self';
    case 'partner_org':
      return 'Partner Org';
    case 'admin':
      return 'Admin';
  }
}
