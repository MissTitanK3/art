import { resolvePermissionsFromRoles } from '@workspace/store/utils/access';

/**
 * UI-layer permission helpers.
 * These wrap the shared store helpers and add small, product-driven
 * allowances used by UI components (for example permitting
 * `dispatcher_basic` to manage instructors).
 */
export function canManageInstructorsFromRoles(roles?: string[] | null) {
  const r = (roles ?? []).map((s) => String(s ?? '').toLowerCase());
  const perms = resolvePermissionsFromRoles(r);
  if (perms.canManageInstructorsFromRole) return true;
  // Product requirement: allow dispatcher_basic UI access as well.
  if (r.includes('dispatcher_basic')) return true;
  return false;
}

export default {
  canManageInstructorsFromRoles,
};
// Re-export canonical access helpers from the shared store package so callers
// can import from `@workspace/ui/lib/permissions` (existing uses) or from
// `@workspace/store/utils/access` (new unified location).
export { resolvePermissionsFromRoles, ACADEMY_ROLES } from '@workspace/store/utils/access';
export type { Permissions, RoleName } from '@workspace/store/utils/access';
