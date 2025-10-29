// Server-safe input (no functions/classes)
import { LucideIcon, NavIconId } from '@workspace/ui/components/icons/nav-icons';
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
export const podAdmins: NavRole[] = [
  'dispatcher_admin',
  'dispatcher_verified',
  'dispatcher_basic',
  'admin',
  'regional_admin',
  'national_admin',
];

export const localAdmins: NavRole[] = [
  'dispatcher_admin',
  'dispatcher_verified',
  'dispatcher_basic',
  'admin',
  'regional_admin',
  'national_admin',
];

/** Full administrative powers at the region level */
export const regionAdmins: NavRole[] = ['admin', 'regional_admin', 'national_admin'];

/** Top-level oversight (cross-region) */
export const nationalAdmins: NavRole[] = ['national_admin'];

export type NavItemInput = {
  label: string;
  href?: string;
  icon?: NavIconId; // <-- string id, not a component
  external?: boolean;
  badge?: string;
  roles?: NavRole[];
  children?: NavItemInput[];
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

export function isActive(href: string | undefined, pathname: string) {
  if (!href) return false;
  try {
    const u = new URL(href, 'http://local');
    return pathname === u.pathname || pathname.startsWith(u.pathname + '/');
  } catch {
    return pathname === href || pathname.startsWith(href + '/');
  }
}
export function canSee(item: NavItem, role?: NavRole, _isAuthenticated = false) {
  // If no roles are specified, the item is public
  if (!item.roles?.length) return true;

  // Require an explicit role match for any role-restricted item
  if (!role) return false;
  return item.roles.includes(role);
}
