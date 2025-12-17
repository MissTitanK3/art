import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedProfile } from "@/lib/api/dispatches/utils";
import type {
  DispatchImpactMetrics,
  ImpactRiskLevel,
  VolunteerAttribution,
  VolunteerAttributionSummary,
} from "@workspace/store/types/dispatch.ts";
import type { AccessRole } from "@workspace/store/types/roles.ts";
import type { Profile } from "@workspace/store/types/global.ts";

const MAX_SINGLE_INCREMENT_MINUTES = 8 * 60;
const MAX_DISPATCH_MINUTES = 24 * 60;
const RAPID_CLICK_WINDOW_MS = 4_000;
const DISPATCHER_ROLES: AccessRole[] = [
  "dispatcher_basic",
  "dispatcher_verified",
  "dispatcher_admin",
  "admin",
  "regional_admin",
  "national_admin",
];
const DISPATCH_ADMIN_ROLES: AccessRole[] = [
  "dispatcher_admin",
  "admin",
  "regional_admin",
  "national_admin",
];
const ALLOWED_ACTIVITY_TYPES = new Set([
  "ops",
  "logistics",
  "comms",
  "support",
  "wellness",
  "training",
  "other",
]);

type Supabase = SupabaseClient<any, "public", any>;

export type DispatchVolunteerHoursResponse = {
  attributions: VolunteerAttribution[];
  summary: VolunteerAttributionSummary;
};

function assertDispatcher(profile?: Profile | null) {
  if (!profile || !DISPATCHER_ROLES.includes(profile.access_role as AccessRole)) {
    throw new Error("AUTH_REQUIRED");
  }
}

function isDispatcherAdmin(profile?: Profile | null) {
  if (!profile) return false;
  return DISPATCH_ADMIN_ROLES.includes(profile.access_role as AccessRole);
}

function sanitizeText(value?: string | null, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function sanitizeActivityType(raw?: string | null): string {
  if (typeof raw !== "string") return "ops";
  const value = raw.trim().toLowerCase();
  return ALLOWED_ACTIVITY_TYPES.has(value) ? value : "other";
}

function clampAttributedAt(value?: string | null): string {
  const now = new Date();
  if (!value) return now.toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed > now) {
    return now.toISOString();
  }
  return parsed.toISOString();
}

function summarizeAttributions(
  attributions: VolunteerAttribution[],
): VolunteerAttributionSummary {
  const totalMinutes = attributions.reduce(
    (sum, entry) => sum + (entry.status === "active" ? entry.minutes : 0),
    0,
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const anomalyCount = attributions.filter((a) => a.anomaly_flag).length;
  const progressRatio = Math.min(totalMinutes / MAX_DISPATCH_MINUTES, 1);
  return {
    totalMinutes,
    totalHours,
    progressRatio,
    anomalyCount,
  };
}

function mapAttributionRow(row: any): VolunteerAttribution {
  return {
    id: String(row.id),
    dispatch_id: String(row.dispatch_id),
    profile_id: row.profile_id ? String(row.profile_id) : null,
    minutes: Number(row.minutes ?? 0),
    activity_type: row.activity_type ?? "ops",
    status: row.status ?? "active",
    notes: row.notes ?? null,
    anomaly_flag: Boolean(row.anomaly_flag),
    attributed_at: String(row.attributed_at ?? new Date().toISOString()),
    updated_at: row.updated_at ? String(row.updated_at) : null,
    attributed_by: String(row.attributed_by ?? ""),
    profile_display_name: row.profile?.display_name ?? null,
    dispatch_label: row.dispatch?.location_label ?? null,
    dispatch_status: row.dispatch?.status ?? undefined,
  };
}

async function fetchActiveMinutes(
  supabase: Supabase,
  dispatchId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("volunteer_attributions")
    .select("minutes")
    .eq("dispatch_id", dispatchId)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.minutes ?? 0),
    0,
  );
}

async function guardRapidDuplicate(
  supabase: Supabase,
  dispatchId: string,
  userId: string,
  minutes: number,
  profileId: string | null,
) {
  const { data, error } = await supabase
    .from("volunteer_attributions")
    .select("id, attributed_at, minutes, profile_id")
    .eq("dispatch_id", dispatchId)
    .eq("attributed_by", userId)
    .order("attributed_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const last = Array.isArray(data) ? data[0] : null;
  if (!last) return;
  const lastTime = new Date(last.attributed_at ?? "");
  if (Number.isNaN(lastTime.getTime())) return;
  const delta = Date.now() - lastTime.getTime();
  const sameMinutes = Number(last.minutes ?? 0) === minutes;
  const sameProfile =
    (last.profile_id ?? null) === (profileId ? String(profileId) : null);
  if (delta < RAPID_CLICK_WINDOW_MS && sameMinutes && sameProfile) {
    throw new Error("Duplicate attribution detected. Please pause and try again.");
  }
}

async function listActiveAttributions(
  supabase: Supabase,
  dispatchId: string,
): Promise<DispatchVolunteerHoursResponse> {
  const { data, error } = await supabase
    .from("volunteer_attributions")
    .select("*, profile:profiles(display_name)")
    .eq("dispatch_id", dispatchId)
    .eq("status", "active")
    .order("attributed_at", { ascending: false });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  const attributions = rows.map(mapAttributionRow);
  return {
    attributions,
    summary: summarizeAttributions(attributions),
  };
}

export async function getVolunteerHoursByDispatch(
  dispatchId: string,
): Promise<DispatchVolunteerHoursResponse> {
  if (!dispatchId) throw new Error("dispatchId is required");
  const { supabase, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);
  return listActiveAttributions(supabase, dispatchId);
}

export async function getVolunteerAttributionAudit(dispatchId: string) {
  if (!dispatchId) throw new Error("dispatchId is required");
  const { supabase, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);
  const { data, error } = await supabase
    .from("volunteer_attributions")
    .select("*, profile:profiles(display_name)")
    .eq("dispatch_id", dispatchId)
    .order("attributed_at", { ascending: false })
    .order("updated_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return rows.map(mapAttributionRow);
}

export async function addVolunteerHours(params: {
  dispatchId: string;
  profileId?: string | null;
  minutes: number;
  activityType?: string;
  notes?: string;
  attributedAt?: string;
}): Promise<DispatchVolunteerHoursResponse> {
  const { dispatchId } = params;
  if (!dispatchId) throw new Error("dispatchId is required");
  const minutes = Math.floor(Number(params.minutes ?? 0));
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error("Minutes must be a positive number");
  }
  if (minutes > MAX_SINGLE_INCREMENT_MINUTES) {
    throw new Error("Single increments cannot exceed 8 hours (480 minutes)");
  }

  const { supabase, user, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);

  await guardRapidDuplicate(
    supabase,
    dispatchId,
    user.id,
    minutes,
    params.profileId ?? null,
  );

  const currentMinutes = await fetchActiveMinutes(supabase, dispatchId);
  const totalAfter = currentMinutes + minutes;

  if (!isDispatcherAdmin(profile) && totalAfter > MAX_DISPATCH_MINUTES) {
    throw new Error(
      "Dispatch volunteer hours are capped at 24 hours. Request dispatcher admin override if needed.",
    );
  }

  const anomalyFlag = minutes >= 360 || totalAfter > MAX_DISPATCH_MINUTES;
  const attributedAt = clampAttributedAt(params.attributedAt);

  const { error } = await supabase.from("volunteer_attributions").insert({
    dispatch_id: dispatchId,
    profile_id: params.profileId ?? null,
    minutes,
    activity_type: sanitizeActivityType(params.activityType),
    notes: sanitizeText(params.notes),
    attributed_by: user.id,
    attributed_at: attributedAt,
    anomaly_flag: anomalyFlag,
  });
  if (error) throw error;

  return listActiveAttributions(supabase, dispatchId);
}

export async function revertVolunteerHours(params: {
  attributionId: string;
  reason: string;
}): Promise<DispatchVolunteerHoursResponse> {
  const { attributionId, reason } = params;
  if (!attributionId) throw new Error("attributionId is required");
  const normalizedReason = sanitizeText(reason, 400);
  if (!normalizedReason) throw new Error("Revert reason is required");

  const { supabase, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);

  const { data: row, error: fetchError } = await supabase
    .from("volunteer_attributions")
    .select("id, dispatch_id, status, notes")
    .eq("id", attributionId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!row) throw new Error("Attribution record not found");
  if (row.status === "reverted") {
    throw new Error("Attribution already reverted");
  }

  const now = new Date().toISOString();
  const revertNote = `Reverted ${now}${
    profile?.display_name ? ` by ${profile.display_name}` : ""
  }: ${normalizedReason}`;
  const combinedNotes = [row.notes, revertNote].filter(Boolean).join("\n");

  const { error: updateError } = await supabase
    .from("volunteer_attributions")
    .update({
      status: "reverted",
      notes: combinedNotes,
      updated_at: now,
    })
    .eq("id", attributionId);
  if (updateError) throw updateError;

  return listActiveAttributions(supabase, row.dispatch_id);
}

const PERIOD_TO_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

function resolveSince(period?: string | null): string | null {
  if (!period || period === "all") return null;
  const days = PERIOD_TO_DAYS[period];
  if (!days) return null;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export async function getVolunteerHoursByProfile(params: {
  profileId: string;
  period?: string | null;
}): Promise<{
  attributions: VolunteerAttribution[];
  summary: VolunteerAttributionSummary;
}> {
  const { profileId, period } = params;
  if (!profileId) throw new Error("profileId is required");
  const { supabase, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);
  const since = resolveSince(period);
  let query = supabase
    .from("volunteer_attributions")
    .select(
      "*, profile:profiles(display_name), dispatch:dispatch_submissions(location_label,status)",
    )
    .eq("profile_id", profileId)
    .eq("status", "active")
    .order("attributed_at", { ascending: false });
  if (since) query = query.gte("attributed_at", since);
  const { data, error } = await query;
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  const attributions = rows.map(mapAttributionRow);
  return {
    attributions,
    summary: summarizeAttributions(attributions),
  };
}

const RISK_LEVELS: ImpactRiskLevel[] = [
  "unknown",
  "low",
  "medium",
  "high",
  "critical",
];

function sanitizeRiskLevel(value?: string | null): ImpactRiskLevel | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase() as ImpactRiskLevel;
  return RISK_LEVELS.includes(normalized) ? normalized : undefined;
}

export async function getDispatchImpactMetrics(
  dispatchId: string,
): Promise<DispatchImpactMetrics> {
  if (!dispatchId) throw new Error("dispatchId is required");
  const { supabase, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);
  const { data, error } = await supabase
    .from("dispatch_submissions")
    .select(
      "id, people_served, resources_distributed, risk_level, updated_at, updated_by",
    )
    .eq("id", dispatchId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Dispatch not found");
  return {
    dispatch_id: dispatchId,
    people_served: Number(data.people_served ?? 0),
    resources_distributed: Number(data.resources_distributed ?? 0),
    risk_level: (data.risk_level ?? "unknown") as ImpactRiskLevel,
    updated_at: data.updated_at ?? null,
    updated_by: data.updated_by ?? null,
  };
}

export async function updateDispatchImpactMetrics(params: {
  dispatchId: string;
  people_served?: number;
  resources_distributed?: number;
  risk_level?: string | null;
}): Promise<DispatchImpactMetrics> {
  const { dispatchId } = params;
  if (!dispatchId) throw new Error("dispatchId is required");
  const patch: Record<string, unknown> = {};

  if (typeof params.people_served === "number") {
    if (params.people_served < 0) {
      throw new Error("People served cannot be negative");
    }
    patch.people_served = Math.floor(params.people_served);
  }

  if (typeof params.resources_distributed === "number") {
    if (params.resources_distributed < 0) {
      throw new Error("Resources distributed cannot be negative");
    }
    patch.resources_distributed = Math.floor(params.resources_distributed);
  }

  const sanitizedRisk = sanitizeRiskLevel(params.risk_level ?? undefined);
  if (sanitizedRisk) {
    patch.risk_level = sanitizedRisk;
  }

  if (Object.keys(patch).length === 0) {
    return getDispatchImpactMetrics(dispatchId);
  }

  const { supabase, user, profile } = await getAuthenticatedProfile();
  assertDispatcher(profile);

  patch.updated_by = user.id;
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("dispatch_submissions")
    .update(patch)
    .eq("id", dispatchId)
    .select(
      "id, people_served, resources_distributed, risk_level, updated_at, updated_by",
    )
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Dispatch not found");

  return {
    dispatch_id: dispatchId,
    people_served: Number(data.people_served ?? 0),
    resources_distributed: Number(data.resources_distributed ?? 0),
    risk_level: (data.risk_level ?? "unknown") as ImpactRiskLevel,
    updated_at: data.updated_at ?? null,
    updated_by: data.updated_by ?? null,
  };
}
