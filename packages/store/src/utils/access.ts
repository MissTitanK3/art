// Shared access and permission helpers for server and client code.
// Keep this file pure (no network I/O) so it can be imported from apps and packages.
import type { NavRole } from './nav';

/**
 * Checks if a profile state indicates the user is suspended.
 */
export function isSuspended(state?: string | null) {
  return state === 'suspended';
}

/**
 * Checks if a user has been verified by a third party (not self-verified).
 * Consider anything other than 'self' as verified by a third party/admin.
 */
export function isVerified(verified_by?: string | null) {
  return !!verified_by && verified_by !== 'self';
}

/**
 * @deprecated Use `evaluateAccess` from `@workspace/store/utils/permissions/unifiedEngine` instead.
 */
export function hasRole(role: string | undefined | null, allowed: readonly NavRole[]) {
  if (!role) return false;
  return allowed.includes(role as NavRole);
}

export { NavRole };
