import {
  DispatchStatus,
  DispatchType,
  DispatchUpdate,
  LogisticsItem,
  ImpactRiskLevel,
  VolunteerAttribution,
} from './dispatch.ts';
import { RosterEntry } from './pod.ts';
import { WeeklyAvailability } from './profile.ts';
import { AccessRole, FieldRole, VerifiedBy } from './roles.ts';
import type { RegionOperationalMinimumOverride } from './academy-readiness.ts';

export type DispatchPermissionLayer = 'awareness' | 'planning' | 'coordination' | 'outcomes';

export type LinkLikeProps = {
  href?: string;
  className?: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler;
};
export type LinkLike = React.ComponentType<LinkLikeProps>;

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  access_role: AccessRole;
  field_roles: FieldRole[];
  verified_by: VerifiedBy;
  affiliation?: string;
  availability: boolean;
  contact_signal?: string;
  coordination_zone?: string;
  last_profile_check_in?: string | null;
  inserted_at: string;
  updated_at?: string | null;
  coverage_zones: string[];
  state: string;
  weekly_availability?: WeeklyAvailability;
  self_risk_acknowledged: boolean;
  city?: string;
  operating_counties: string[];
  self_status_flags?: string[];
};

export interface DispatchSubmission {
  id: string;
  /** Brief summary of the event for situational awareness */
  summary?: string;
  type?: DispatchType;
  location?: { lat: number; lng: number; [key: string]: any };
  timestamp: string;
  /** When the event is scheduled to occur or occurred; defaults to now for rapid responses */
  date_of_event?: string | null;
  /** Mark for coordinator review (non-blocking) */
  flagged?: boolean;
  required_roles?: string[];
  encrypted_payload?: string;
  auto_delete_after?: string | null;
  integrity_hash?: string;
  submitted_by?: string | null;
  source?: 'dispatch' | 'manual' | 'system';
  visibility_radius_km?: number;
  /** Controls who can see this dispatch - critical for privacy */
  visibility_scope?: 'org_only' | 'org_and_region_masked' | 'region' | 'federated' | 'public';
  status: DispatchStatus;
  assigned_volunteers?: Partial<RosterEntry>[];
  required_roles_by_type?: Record<string, number>;
  location_label?: string;
  point_of_contact?: string | null;
  state?: string;
  intended_action_preset?: string;
  intended_action_notes?: string;
  intended_actions?: string[];
  intended_actions_custom?: string;
  signal_link?: string;
  public_signal_link?: string;
  training?: boolean;
  people_served?: number;
  resources_distributed?: number;
  risk_level?: ImpactRiskLevel;
  updated_by?: string | null;
  updated_at?: string | null;
  volunteer_attributions?: VolunteerAttribution[];
  updates?: DispatchUpdate[];
  logistics: LogisticsItem[];
  /** Per-member permission overrides. Key: profile_id, Value: array of permission layers */
  member_permissions?: Record<string, DispatchPermissionLayer[]>;
}

export type RegionSettings = {
  regionLabel: string;
  timezone: string;
  coordination_zone: string;
  defaultDispatchRadiusKm: number;
  cleanupIntervalsDays: number;
  integrationSignalGroup?: string;
  federationEndpoint?: string;
  roleEscalationRules?: string; // JSON or text rules
  operationalMinimumsOverrides?: RegionOperationalMinimumOverride[];
  notificationsDisabled: boolean;
};
