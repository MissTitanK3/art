// Comms module shared types

export type CommsMessageType = "Routine" | "Priority" | "Emergency";
export type CommsImportance = "Low" | "Normal" | "High";
export type StationType = "Portable" | "Mobile" | "Base" | "Relay" | "Other";
export type EncryptionMode = "Clear" | "AES-256" | "Proprietary" | "Other";

export interface ComTeam {
  id: string;
  name: string;
  channel?: string;
  encryption_mode?: EncryptionMode;
  assigned_dispatch_lead?: string; // profile id or name
  notes?: string;
  default_check_in_interval_minutes?: number; // optional override at team level
  last_check_in?: string | null; // ISO; team-level check-in tracking
  location_label?: string; // human-readable placemark
}

export interface ComOperator {
  id: string;
  callsign: string;
  sector?: string;
  station_name?: string;
  station_type?: StationType;
  assigned_roles?: string[];
  linked_units?: string[];
  frequency?: string;
  battery_status?: "Full" | "Good" | "Low" | "Critical";
  coms_condition?: "Clear" | "Static" | "Intermittent" | "Down";
  status?: "Active" | "Standby" | "Offshift" | "Unknown";
  check_in_interval_minutes?: number; // operator override
  last_check_in?: string | null; // ISO
  handoff_to?: string | null; // operator id
  team_id?: string | null;
}

export interface ComLog {
  id: string;
  event_id: string; // dispatch/event id
  operator_id?: string | null;
  incident_id?: string | null;
  message: string;
  message_type: CommsMessageType;
  importance: CommsImportance;
  timestamp: string; // ISO
  tags?: string[];
}

export interface ComChannel {
  id: string;
  team_id?: string | null;
  channel_name: string;
  frequency?: string;
  cross_team_relays?: string[]; // team ids or names
  handover_notes?: string;
}

export interface ComBriefing {
  id: string;
  event_id: string; // dispatch/event id
  overview?: string;
  comms_plan?: string;
  safety_notes?: string;
  updates?: string;
  updated_at: string; // ISO
}

export interface ComAlert {
  id: string;
  event_id: string; // dispatch/event id
  direction: string;
  description: string;
  updated_at: string; // ISO
}
