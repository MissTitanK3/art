// Server-safe input (no functions/classes)

import { LucideIcon, NavIconId } from "../icons/nav-icons.js";

export type NavRole =
  | "guest"
  | "user"
  | "volunteer"
  | "pod_leader"
  | "trainer"
  | "admin"
  | "regional_admin"
  | "national_admin"

  /** Minimum: onboarded and can use core features */
export const completeOnboarding: NavRole[] = [
  "user",
  "volunteer",
  "pod_leader",
  "trainer",
  "admin",
  "regional_admin",
  "national_admin",
]

/** Trusted to manage other people (Pods, volunteers, trust list) */
export const elevatedRoles: NavRole[] = [
  "pod_leader",
  "trainer",
  "admin",
  "regional_admin",
  "national_admin",
]

/** Local Pod-level admins (pod_leader + trainer + admin) */
export const podAdmins: NavRole[] = [
  "pod_leader",
  "trainer",
  "admin",
]

 export const localAdmins: NavRole[] = [
  'admin',
  'national_admin',
  'national_admin'
 ]

/** Full administrative powers at the region level */
export const regionAdmins: NavRole[] = [
  "regional_admin",
  "national_admin",
]

/** Top-level oversight (cross-region) */
export const nationalAdmins: NavRole[] = [
  "national_admin",
]

export type NavItemInput = {
  label: string;
  href?: string;
  icon?: NavIconId;        // <-- string id, not a component
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

export type NavItem = Omit<NavItemInput, "icon" | "children"> & {
  icon?: LucideIcon;
  children?: NavItem[];
};

export type Brand = Omit<BrandInput, "logoSrc"> & {
  logoSrc?: string;
};

export type GlobalNavConfig = {
  brand: Brand;
  primary: NavItem[];
  secondary?: NavItem[];
  hideSearch?: boolean;
};
