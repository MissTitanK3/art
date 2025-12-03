import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile } from "@/lib/api/dispatches/utils";
import type { AccessRole } from "@workspace/store/types/roles";

const DISPATCHER_ROLES: AccessRole[] = [
  "dispatcher_basic",
  "dispatcher_verified",
  "dispatcher_admin",
  "admin",
  "regional_admin",
  "national_admin",
];

const WEEKS = 8;

type TrendPoint = { weekStart: string; hours?: number; people?: number };

function isDispatcher(role?: AccessRole | null) {
  return role ? DISPATCHER_ROLES.includes(role) : false;
}

function toWeekBuckets() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  const weekday = startOfWeek.getUTCDay();
  const offset = (weekday + 6) % 7; // shift so Monday is start
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - offset);
  const buckets: { start: Date; end: Date }[] = [];
  for (let i = WEEKS - 1; i >= 0; i -= 1) {
    const start = new Date(startOfWeek);
    start.setUTCDate(start.getUTCDate() - i * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 7);
    buckets.push({ start, end });
  }
  return buckets;
}

function formatTrend(points: number[], buckets: { start: Date }[], key: "hours" | "people"): TrendPoint[] {
  return buckets.map((bucket, index) => ({
    weekStart: bucket.start.toISOString(),
    [key]: Math.round(((points[index] ?? 0) * 10)) / 10,
  }));
}

export async function GET() {
  try {
    const { supabase, profile } = await getAuthenticatedProfile();
    if (!isDispatcher(profile?.access_role as AccessRole)) {
      throw new Error("AUTH_REQUIRED");
    }

    const buckets = toWeekBuckets();
    const sinceIso = buckets[0]?.start.toISOString();
    const [hoursRow, peopleRow, medianRow] = await Promise.all([
      supabase
        .from("view_total_volunteer_hours_last_30d")
        .select("total_hours")
        .maybeSingle(),
      supabase
        .from("view_total_people_served_last_30d")
        .select("total_people_served")
        .maybeSingle(),
      supabase
        .from("view_median_response_time_last_30d")
        .select("median_minutes")
        .maybeSingle(),
    ]);

    if (hoursRow.error) throw hoursRow.error;
    if (peopleRow.error) throw peopleRow.error;
    if (medianRow.error) throw medianRow.error;

    const volunteerHours = Number(hoursRow.data?.total_hours ?? 0);
    const peopleServed = Number(peopleRow.data?.total_people_served ?? 0);
    const medianResponseMinutes = Number(medianRow.data?.median_minutes ?? 0);

    const { count: highRiskCount, error: highRiskError } = await supabase
      .from("dispatch_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "verified_complete")
      .in("risk_level", ["high", "critical"])
      .gte("timestamp", sinceIso);
    if (highRiskError) throw highRiskError;

    const { data: volunteerRows, error: volunteerError } = await supabase
      .from("volunteer_attributions")
      .select(
        "minutes, attributed_at, dispatch:dispatch_submissions(status)",
      )
      .eq("status", "active")
      .gte("attributed_at", sinceIso ?? "")
      .order("attributed_at", { ascending: true });
    if (volunteerError) throw volunteerError;

    const { data: dispatchRows, error: dispatchError } = await supabase
      .from("dispatch_submissions")
      .select("timestamp, people_served, status")
      .eq("status", "verified_complete")
      .gte("timestamp", sinceIso ?? "")
      .order("timestamp", { ascending: true });
    if (dispatchError) throw dispatchError;

    const volunteerBuckets = Array.from({ length: WEEKS }, () => 0);
    (volunteerRows ?? []).forEach((row: any) => {
      if (row.dispatch?.status !== "verified_complete") return;
      const attributedAt = new Date(row.attributed_at ?? "");
      if (Number.isNaN(attributedAt.getTime())) return;
      const bucketIndex = buckets.findIndex(
        (bucket) => attributedAt >= bucket.start && attributedAt < bucket.end,
      );
      if (bucketIndex === -1) return;
      volunteerBuckets[bucketIndex] += Number(row.minutes ?? 0) / 60;
    });

    const peopleBuckets = Array.from({ length: WEEKS }, () => 0);
    (dispatchRows ?? []).forEach((row: any) => {
      const ts = new Date(row.timestamp ?? "");
      if (Number.isNaN(ts.getTime())) return;
      const bucketIndex = buckets.findIndex(
        (bucket) => ts >= bucket.start && ts < bucket.end,
      );
      if (bucketIndex === -1) return;
      peopleBuckets[bucketIndex] += Math.max(
        0,
        Number(row.people_served ?? 0),
      );
    });

    return NextResponse.json({
      totals: {
        volunteerHours,
        peopleServed,
        medianResponseMinutes,
        highRiskCount: highRiskCount ?? 0,
      },
      hoursTrend: formatTrend(volunteerBuckets, buckets, "hours"),
      peopleTrend: formatTrend(peopleBuckets, buckets, "people"),
    });
  } catch (error) {
    return jsonError(error);
  }
}
