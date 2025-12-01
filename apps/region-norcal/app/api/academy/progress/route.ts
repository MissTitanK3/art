import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseRegionServiceClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { convertPodsToMemberProgress } from "@/lib/utils";
import type { Pod } from "@workspace/store/types/pod";
import type { AcademyTrainingSession } from "@workspace/store/types/academy";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type ProgressStats = {
  completed: number;
  inProgress: number;
  expired: number;
  total: number;
  recertRisk: number;
};

type ProgressResponse = {
  stats: ProgressStats;
  nextSession: {
    id: string;
    title: string;
    start: string;
    modality: string;
    instructorName?: string;
    waitlist?: number;
    confirmed?: number;
    capacity?: number;
  } | null;
  highlights: string[];
};

let cached: { data: ProgressResponse; expiresAt: number } | null = null;

function buildPods(pods: any[], rosterEntries: any[] | null | undefined): Pod[] {
  const rosterByPod = new Map<string, any[]>();
  for (const entry of rosterEntries ?? []) {
    if (!entry.pod_id) continue;
    const list = rosterByPod.get(entry.pod_id) ?? [];
    list.push(entry);
    rosterByPod.set(entry.pod_id, list);
  }

  return pods.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    area: p.area,
    channels: p.channels ?? [],
    team: (rosterByPod.get(p.id) ?? []).map((entry) => ({
      id: entry.id,
      profile_id: entry.profile_id ?? entry.profile?.id,
      profile: entry.profile,
      role: entry.role,
      status: entry.status,
      langs: entry.langs ?? [],
      skills: entry.skills ?? [],
      certs: entry.certs ?? [],
      notes: entry.notes ?? undefined,
      handle: entry.handle ?? "",
      joinedAt: entry.joined_at ?? null,
      lastShiftAt: entry.last_shift_at ?? undefined,
      signal_handle: entry.signal_handle ?? undefined,
    })),
  }));
}

function summarizeStats(members: ReturnType<typeof convertPodsToMemberProgress>): ProgressStats {
  let completed = 0;
  let inProgress = 0;
  let expired = 0;

  for (const member of members) {
    const certs = member.certifications ?? [];
    const hasCompleted = certs.some((c: any) => c?.level === "completed" || c?.level === "mentor");
    const hasExpired = certs.some((c: any) => c?.level === "expired");
    const hasInProgress = certs.some((c: any) => c?.level === "in_progress");

    if (hasCompleted) completed += 1;
    else if (hasExpired) expired += 1;
    else if (hasInProgress) inProgress += 1;
  }

  const total = members.length;
  const recertRisk = expired;

  return { completed, inProgress, expired, total, recertRisk };
}

function mapNextSession(rows: any[]): AcademyTrainingSession | null {
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    classId: row.class_id ?? "",
    title: row.title ?? "Session",
    start: row.start,
    end: row.end,
    modality: row.modality ?? "in_person",
    location: row.location ?? undefined,
    meetingUrl: row.meeting_url ?? undefined,
    instructorName: row.instructor_name ?? undefined,
    instructorType: row.instructor_type ?? "dispatcher",
    status: row.status ?? "scheduled",
    seats: {
      capacity: row.seats?.capacity ?? 0,
      confirmed: row.seats?.confirmed ?? 0,
      waitlist: row.seats?.waitlist ?? 0,
    },
    timezone: row.timezone ?? undefined,
    relatedTopic: row.related_topic ?? undefined,
    participants: [],
  };
}

function buildHighlights(stats: ProgressStats, waitlistedSessions: number, expiringSoon: number): string[] {
  const highlights: string[] = [];
  if (stats.recertRisk > 0) highlights.push(`${stats.recertRisk} need recertification`);
  if (expiringSoon > 0) highlights.push(`${expiringSoon} certifications expiring soon`);
  if (waitlistedSessions > 0) highlights.push(`${waitlistedSessions} sessions have waitlists`);
  return highlights;
}

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "true";
    const now = Date.now();
    if (!refresh && cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data);
    }

    const client = createSupabaseRegionServiceClient();

    const [podsRes, rosterRes, sessionsRes, expiringRes] = await Promise.all([
      client
        .from("pods")
        .select("id, slug, name, area, channels")
        .is("deleted_at", null),
      client
        .from("roster_entries")
        .select(
          "id, pod_id, profile_id, role, status, langs, skills, certs, notes, handle, joined_at, last_shift_at, signal_handle, profile:profiles(*)",
        )
        .is("deleted_at", null),
      client
        .from("academy_sessions")
        .select(
          "id, class_id, title, start, end, modality, location, meeting_url, instructor_name, instructor_type, status, seats, timezone, related_topic",
        )
        .gte("start", new Date().toISOString())
        .order("start", { ascending: true })
        .limit(5),
      client
        .from("roster_entries")
        .select("id, certs")
        .is("deleted_at", null),
    ]);

    if (podsRes.error) throw podsRes.error;
    if (rosterRes.error) throw rosterRes.error;
    if (sessionsRes.error) throw sessionsRes.error;
    if (expiringRes.error) throw expiringRes.error;

    const pods = buildPods(podsRes.data ?? [], rosterRes.data ?? []);
    const members = convertPodsToMemberProgress(pods);
    const stats = summarizeStats(members);

    const nextSession = mapNextSession(sessionsRes.data ?? []);
    const waitlistedSessions = (sessionsRes.data ?? []).filter(
      (s: any) => (s.seats?.waitlist ?? 0) > 0,
    ).length;

    // Expiring soon: basic heuristic from roster certs with expires_at within 30d if present
    const expiringSoon = (expiringRes.data ?? []).reduce((acc: number, row: any) => {
      const certs = row?.certs ?? [];
      for (const cert of certs) {
        const exp = cert?.expires_at ?? cert?.expiresAt;
        if (!exp) continue;
        const dt = new Date(exp).getTime();
        if (Number.isNaN(dt)) continue;
        const now = Date.now();
        const inThirty = now + 30 * 24 * 60 * 60 * 1000;
        if (dt >= now && dt <= inThirty) {
          acc += 1;
          break;
        }
      }
      return acc;
    }, 0);

    const highlights = buildHighlights(stats, waitlistedSessions, expiringSoon);

    const response: ProgressResponse = {
      stats,
      nextSession: nextSession
        ? {
            id: nextSession.id,
            title: nextSession.title,
            start: nextSession.start,
            modality: nextSession.modality,
            instructorName: nextSession.instructorName,
            waitlist: nextSession.seats?.waitlist,
            confirmed: nextSession.seats?.confirmed,
            capacity: nextSession.seats?.capacity,
          }
        : null,
      highlights,
    };

    cached = { data: response, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
