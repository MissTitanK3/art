import { DispatchSubmission, Profile } from "../types/global.ts";
import { NormalizedLanguage } from "../types/language.ts";
import { NormalizedCertification, RosterEntry } from "../types/pod.ts";
import { DispatchProfile } from "../types/profile.ts";
import { FieldRole } from "../types/roles.ts";

export function makeDispatchSubmission(
  overrides: Partial<DispatchSubmission> = {},
): DispatchSubmission {
  return {
    id: crypto.randomUUID(), // or fakeUUID if you prefer
    timestamp: new Date().toISOString(),
    date_of_event: new Date().toISOString(),
    source: "dispatch",
    flagged: false,
    visibility_radius_km: 10,
    status: "unconfirmed",
    training: false,
    logistics: [],
    ...overrides,
  };
}

type MakeProfileOptions = Partial<
  Omit<Profile, "id" | "display_name" | "field_roles" | "affiliation">
> & {
  registered?: boolean;
  userId?: string;
};

export const makeProfile = (
  id: string,
  display: string,
  role: FieldRole[],
  affiliation?: string,
  options?: MakeProfileOptions,
): Profile => {
  const { registered = true, userId, ...overrides } = options ?? {};

  const slug = display.toLowerCase().replace(/\s+/g, "_");
  const base: Profile = {
    id,
    user_id: registered ? (userId ?? `user-${id}`) : "",
    display_name: display,
    access_role: "team_member",
    field_roles: role,
    verified_by: "self",
    affiliation,
    availability: true,
    contact_signal: registered ? `${slug}@signal` : undefined,
    coordination_zone: "zone-1",
    inserted_at: new Date().toISOString(),
    coverage_zones: ["06001"],
    state: "active",
    weekly_availability: undefined,
    self_risk_acknowledged: true,
    city: undefined,
    operating_counties: ["06001"],
  };

  const merged = {
    ...base,
    ...overrides,
  };

  // Ensure contact signal defaults to undefined for manual additions without overrides.
  if (!registered && overrides.contact_signal === undefined) {
    merged.contact_signal = undefined;
  }

  // Guard against accidental undefined arrays.
  merged.coverage_zones = merged.coverage_zones ?? [];
  merged.operating_counties = merged.operating_counties ?? [];

  return merged;
};

function toDispatchProfile(
  profile: Profile | DispatchProfile,
): DispatchProfile {
  const coverageZones = Array.isArray(profile.coverage_zones)
    ? profile.coverage_zones.map((zone: any) =>
        typeof zone === "string" ? { id: zone, label: zone } : zone,
      )
    : [];

  const operatingCounties = Array.isArray(profile.operating_counties)
    ? profile.operating_counties
    : [];

  const selfStatusFlags = (profile as any).self_status_flags;

  return {
    ...profile,
    user_id:
      profile.user_id && profile.user_id.length > 0 ? profile.user_id : null,
    coverage_zones: coverageZones,
    weekly_availability: profile.weekly_availability,
    operating_counties: operatingCounties,
    self_status_flags: Array.isArray(selfStatusFlags) ? selfStatusFlags : [],
  } as DispatchProfile;
}

export const makeRosterEntry = (
  id: string,
  profile: Profile | DispatchProfile,
  role: "lead" | "member" | "trainee",
  status: "active" | "inactive" | "suspended",
  langs: NormalizedLanguage[],
  skills: string[],
  certs: NormalizedCertification[] = [],
  lastShiftAt?: string,
  notes?: string,
): RosterEntry => {
  const normalizedProfile = toDispatchProfile(profile);
  return {
    id,
    profile: normalizedProfile,
    role,
    status,
    langs,
    skills,
    handle: profile.display_name.toLowerCase().replace(/\s+/g, "-"),
    joinedAt: new Date().toISOString(),
    certs,
    lastShiftAt,
    notes,
    signal_handle: normalizedProfile.contact_signal ?? undefined,
  };
};
