export interface DispatchAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // blob:// URL for temporary display
}

export interface DispatchUpdate {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  attachments?: DispatchAttachment[];
}

export interface LogisticsItem {
  id: string;
  category: "transport" | "supply" | "comms" | "rally_point" | "other";
  description: string;
  quantity?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "delivered" | "cancelled";
  responsibleParty?:
    | { type: "user"; userId: string }
    | { type: "anon"; name: string };
  warehouse?: { name?: string; location?: string; contact?: string };
  accountabilityNotes?: string;
  updatedAt: string;
}

export type DispatchStatus =
  | "preplanning"
  | "unconfirmed"
  | "confirmed"
  | "mobilizing"
  | "in_progress"
  | "debriefing"
  | "completed"
  | "verified_complete"
  | "cancelled"
  | "expired"
  | "archived";

export type DispatchType =
  | "rapid_response"
  | "planned_event"
  | "training"
  | "community_aid"
  | "technical_aid"
  | "other";

export const DISPATCH_TYPE_VARIANTS: Record<
  DispatchType,
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
> = {
  rapid_response: "destructive", // red
  planned_event: "info", // blue
  training: "warning", // yellow
  community_aid: "success", // green
  technical_aid: "secondary", // purple/neutral
  other: "outline", // gray/fallback
};

export const DISPATCH_TYPE_LABELS: Record<DispatchType, string> = {
  rapid_response: "Rapid Response",
  planned_event: "Planned Event",
  training: "Training",
  community_aid: "Community Aid",
  technical_aid: "Technical Aid",
  other: "Other",
};

export function getDispatchTypeStyle(type: DispatchType) {
  return DISPATCH_TYPE_VARIANTS[type] ?? DISPATCH_TYPE_VARIANTS.other;
}

export type ImpactRiskLevel =
  | "unknown"
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface VolunteerAttribution {
  id: string;
  dispatch_id: string;
  profile_id: string | null;
  minutes: number;
  activity_type: string;
  status: "active" | "reverted";
  notes?: string | null;
  anomaly_flag?: boolean;
  attributed_at: string;
  updated_at?: string | null;
  attributed_by: string;
  profile_display_name?: string | null;
  dispatch_label?: string | null;
  dispatch_status?: DispatchStatus;
}

export interface VolunteerAttributionSummary {
  totalMinutes: number;
  totalHours: number;
  progressRatio: number;
  anomalyCount: number;
}

export interface DispatchVolunteerHoursResponse {
  attributions: VolunteerAttribution[];
  summary: VolunteerAttributionSummary;
}

export interface DispatchImpactMetrics {
  dispatch_id: string;
  people_served: number;
  resources_distributed: number;
  risk_level: ImpactRiskLevel;
  updated_at?: string | null;
  updated_by?: string | null;
}
