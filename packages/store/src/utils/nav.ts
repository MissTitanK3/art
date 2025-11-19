// Server-safe input (no functions/classes)
import { LucideIcon, NavIconId } from '@workspace/ui/components/icons/nav-icons';
/**
 * Navigation roles and access helpers
 *
 * This module centralizes the role taxonomy used by the app and the convenience
 * groupings that drive what a user can see in the global navigation. It also
 * provides a small helper to determine whether a given nav item should be
 * visible to the current user (canSee) and a path helper (isActive).
 *
 * Quick reference:
 * - team_member: onboarded volunteer; lowest access
 * - pod_leader: leads a pod; can manage local work
 * - trainer: facilitates training and classes
 * - dispatcher_basic: dispatcher in training or limited duties
 * - dispatcher_verified: verified dispatcher with broader access
 * - dispatcher_admin: admin dispatcher; can manage instructors and sessions
 * - admin: region admin (alias for regionAdmins grouping)
 * - regional_admin: explicit region admin role
 * - national_admin: cross‑region oversight
 */
export type NavRole =
  | 'team_member'
  | 'pod_leader'
  | 'trainer'
  | 'dispatcher_basic'
  | 'dispatcher_verified'
  | 'dispatcher_admin'
  | 'admin'
  | 'regional_admin'
  | 'national_admin';

/**
 * Minimum: onboarded and can use core features
 * Access to
 * `/watch`,
 * `/academy`,
 * `/intents`,
 * `/roles`,
 * `/impact`,
 * `/pods`,
 * `/pods/new`
 * `/missing-persons`
 */
// Minimum: onboarded and can use core features. Use this for items that
// should appear to anyone with a real profile in the region.
export const completeOnboarding: NavRole[] = [
  'team_member',
  'pod_leader',
  'trainer',
  'dispatcher_basic',
  'dispatcher_verified',
  'dispatcher_admin',
  'admin',
  'regional_admin',
  'national_admin',
];

/**
 * Elevated roles with trusted access to manage people and pods
 * Access completeOnboarding and to:
 * `/dispatches`,
 * `/schedules`,
 * `/team-req`
 */
// Elevated roles with trusted access to create/coordinate dispatch work and
// scheduling. Use for items like Dispatches, Schedules, and Team Requests.
export const elevatedRoles: NavRole[] = [
  'pod_leader',
  'trainer',
  'dispatcher_admin',
  'dispatcher_verified',
  'dispatcher_basic',
  'admin',
  'regional_admin',
  'national_admin',
];

/**
 * Trusted to manage other people (Pods, volunteers, trust list)
 * Access to completeOnboarding and elevatedRoles features:
 * `/admin`,
 */
// Trusted to manage people, pods, and related admin areas. Grants /admin.
export const podAdmins: NavRole[] = [
  'dispatcher_admin',
  'dispatcher_verified',
  'dispatcher_basic',
  'admin',
  'regional_admin',
  'national_admin',
];

// Same as podAdmins — kept for semantic clarity when scoping local controls.
export const localAdmins: NavRole[] = [
  'dispatcher_admin',
  'dispatcher_verified',
  'dispatcher_basic',
  'admin',
  'regional_admin',
  'national_admin',
];

/**
 * Verified to manage other people (Pods, volunteers, trust list)
 * Access to completeOnboarding and elevatedRoles features:
 * `/admin`,
 */
// Verified to manage people, pods, and related admin areas. Grants /admin.
export const verifiedAdmins: NavRole[] = [
  'dispatcher_admin',
  'dispatcher_verified',
  'admin',
  'regional_admin',
  'national_admin',
];

/** Full administrative powers at the region level */
// Full administrative powers at the region level and above.
export const regionAdmins: NavRole[] = ['admin', 'regional_admin', 'national_admin'];

/** Top-level oversight (cross-region) */
export const nationalAdmins: NavRole[] = ['national_admin'];

export type NavMatchBehavior = 'exact' | 'startsWith';

export type NavItemInput = {
  label: string;
  href?: string;
  icon?: NavIconId; // <-- string id, not a component
  external?: boolean;
  badge?: string;
  roles?: NavRole[];
  children?: NavItemInput[];
  /**
   * Controls how active-state detection works for this item. Defaults to
   * "startsWith" (match on the exact path or nested routes). Use "exact" for
   * routes that should only highlight on a single pathname.
   */
  match?: NavMatchBehavior;
};

export type BrandInput = {
  name: string;
  href?: string;
  // Keep logos server-serializable: a string src or omit. No ReactNode here.
  logoSrc?: string;
};

export type GlobalNavConfigInput = {
  brand: BrandInput;
  primary: NavItemInput[];
  secondary?: NavItemInput[];
  hideSearch?: boolean;
};

// Client-resolved types

export type NavItem = Omit<NavItemInput, 'icon' | 'children'> & {
  icon?: LucideIcon;
  children?: NavItem[];
};

export type Brand = Omit<BrandInput, 'logoSrc'> & {
  logoSrc?: string;
};

export type GlobalNavConfig = {
  brand: Brand;
  primary: NavItem[];
  secondary?: NavItem[];
  hideSearch?: boolean;
};

/**
 * Returns true when the current URL pathname matches (or is nested under)
 * the item's href. Accepts absolute or relative hrefs.
 */
function normalizePath(path: string | undefined) {
  if (!path) return '/';
  if (path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
}

export function isActive(href: string | undefined, pathname: string, match: NavMatchBehavior = 'startsWith') {
  if (!href) return false;
  try {
    const u = new URL(href, 'http://local');
    const targetPath = normalizePath(u.pathname);
    const currentPath = normalizePath(pathname);

    if (match === 'exact') {
      return currentPath === targetPath;
    }

    if (targetPath === '/') {
      return currentPath === '/';
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  } catch {
    const targetPath = normalizePath(href);
    const currentPath = normalizePath(pathname);

    if (match === 'exact') {
      return currentPath === targetPath;
    }

    if (targetPath === '/') {
      return currentPath === '/';
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  }
}
/**
 * Determines whether a user with `role` should see a nav item.
 *
 * Rules:
 * - No roles on the item → public (visible to all).
 * - Roles set on the item → require an explicit match.
 *
 * Compose with the exported groupings (e.g., completeOnboarding, elevatedRoles)
 * when authoring nav configs so intent stays readable.
 */
export function canSee(item: NavItem, role?: NavRole, _isAuthenticated = false) {
  if (!item.roles?.length) return true;
  if (!role) return false;
  return item.roles.includes(role);
}
