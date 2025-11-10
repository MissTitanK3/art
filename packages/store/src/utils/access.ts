// Shared access and permission helpers for server and client code.
// Keep this file pure (no network I/O) so it can be imported from apps and packages.
import type { NavRole } from './nav';

export type RoleName =
  | 'trainer'
  | 'dispatcher_basic'
  | 'dispatcher_verified'
  | 'dispatcher_admin'
  | 'admin'
  | 'regional_admin'
  | 'national_admin';

export type Permissions = {
  canManageInstructorsFromRole: boolean;
  canManageSessions: boolean;
  canScheduleClasses: boolean;
  canCreatePathwayClass: boolean;
};

/**
 * Lightweight checks that mirror the small helpers used in app guard wrappers.
 * These are intentionally pure and accept primitive pieces of profile state so
 * callers (server route wrappers) can fetch the profile and then call into
 * these helpers to decide routing/authorization.
 */
export function isSuspended(state?: string | null) {
  return state === 'suspended';
}

export function isVerified(verified_by?: string | null) {
  // Consider anything other than 'self' as verified by a third party/admin
  return !!verified_by && verified_by !== 'self';
}

export function hasRole(role: string | undefined | null, allowed: readonly NavRole[]) {
  if (!role) return false;
  return allowed.includes(role as NavRole);
}

export function resolvePermissionsFromRoles(roles: string[] | undefined): Permissions {
  const set = new Set((roles ?? []).map((r) => String(r ?? '').toLowerCase()));

  const canManageInstructorsFromRole =
    set.has('dispatcher_verified') ||
    set.has('dispatcher_admin') ||
    set.has('admin') ||
    set.has('regional_admin') ||
    set.has('national_admin');

  const canManageSessions =
    set.has('trainer') ||
    set.has('dispatcher_verified') ||
    set.has('dispatcher_admin') ||
    set.has('admin') ||
    set.has('regional_admin') ||
    set.has('national_admin');

  const canScheduleClasses = canManageSessions;

  const canCreatePathwayClass =
    set.has('dispatcher_admin') ||
    set.has('dispatcher_verified') ||
    set.has('admin') ||
    set.has('regional_admin') ||
    set.has('national_admin');

  return {
    canManageInstructorsFromRole,
    canManageSessions,
    canScheduleClasses,
    canCreatePathwayClass,
  };
}

export const ACADEMY_ROLES: RoleName[] = [
  'trainer',
  'dispatcher_basic',
  'dispatcher_verified',
  'dispatcher_admin',
  'admin',
  'regional_admin',
  'national_admin',
];

export { NavRole };
