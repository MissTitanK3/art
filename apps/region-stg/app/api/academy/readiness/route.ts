import { NextResponse } from "next/server";
import {
  DEFAULT_REGION_OPERATIONAL_MINIMUMS,
  buildRegionOperationalMinimums,
  createRegionReadinessChecklist,
  evaluateOperationalMinimums,
  parseRegionOperationalMinimumOverrides,
} from "@/lib/academy/region-minimums";
import { createSupabaseRegionServiceClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import type {
  RegionOperationalMinimumDefinition,
  RegionOperationalMinimumSnapshot,
  RegionReadinessChecklistItem,
} from "@workspace/store/types/academy-readiness";
import type { Pod, RosterEntry } from "@workspace/store/types/pod";
import { convertPodsToMemberProgress } from "@/lib/utils";
import type { AcademyTrainingSession } from "@workspace/store/types/academy";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

const REGION_SETTINGS_SLUG =
  process.env.NEXT_PUBLIC_REGION_ID ||
  process.env.NEXT_PUBLIC_BRAND_SLUG ||
  "default";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type ReadinessPayload = {
  score: number;
  scoreMethod: string;
  checklist: RegionReadinessChecklistItem[];
  criticalNeeds: Array<{
    roleLabel: string;
    deficitSummary?: string;
    coverageStatus: RegionOperationalMinimumSnapshot["coverageStatus"];
  }>;
  snapshots: Array<
    Pick<
      RegionOperationalMinimumSnapshot,
      | "key"
      | "label"
      | "coverageStatus"
      | "activeCount"
      | "requiredCount"
      | "inProgressCount"
      | "expiredCount"
      | "coveragePercent"
    >
  >;
};

let cached: { data: ReadinessPayload; expiresAt: number } | null = null;

function buildPods(
  pods: any[],
  rosterEntries: any[] | null | undefined,
): Pod[] {
  const rosterByPod = new Map<string, RosterEntry[]>();

  for (const entry of rosterEntries ?? []) {
    const podId = entry.pod_id;
    if (!podId) continue;
    const team = rosterByPod.get(podId) ?? [];
    team.push({
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
    } as RosterEntry);
    rosterByPod.set(podId, team);
  }

  return pods.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    area: p.area,
    channels: p.channels ?? [],
    team: rosterByPod.get(p.id) ?? [],
  }));
}

function mapSessions(
  rows: any[],
  participantsBySession: Map<string, any[]>,
): AcademyTrainingSession[] {
  return rows.map((row) => ({
    id: row.id,
    classId: row.class_id ?? "",
    title: row.title ?? "Untitled session",
    start: row.start,
    end: row.end,
    modality: row.modality ?? "in_person",
    location: row.location ?? undefined,
    meetingUrl: row.meeting_url ?? undefined,
    instructorName: row.instructor_name ?? "Instructor",
    instructorType: row.instructor_type ?? "dispatcher",
    status: row.status ?? "scheduled",
    seats: {
      capacity: row.seats?.capacity ?? 0,
      confirmed: row.seats?.confirmed ?? 0,
      waitlist: row.seats?.waitlist ?? 0,
    },
    timezone: row.timezone ?? undefined,
    relatedTopic: row.related_topic ?? undefined,
    participants: participantsBySession.get(row.id) ?? [],
  }));
}

function computeScore(checklist: RegionReadinessChecklistItem[]): number {
  if (!checklist || checklist.length === 0) return 0;
  const value = checklist.reduce((acc, item) => {
    if (item.status === "met") return acc + 1;
    if (item.status === "at_risk") return acc + 0.5;
    return acc;
  }, 0);
  return value / checklist.length;
}

function deriveCriticalNeeds(
  snapshots: RegionOperationalMinimumSnapshot[],
): ReadinessPayload["criticalNeeds"] {
  return snapshots
    .filter((s) => s.coverageStatus !== "met")
    .map((s) => ({
      roleLabel: s.label ?? s.key,
      deficitSummary:
        s.deficitSummary ||
        s.coverageSummary ||
        (s.gaps && s.gaps.length > 0 ? s.gaps.join(", ") : undefined),
      coverageStatus: s.coverageStatus,
    }));
}

export async function GET(req: Request) {
  try {
    // Auth gate: must be signed in (same as academy hub entry)
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

    const [settingsRes, podsRes, rosterRes, sessionsRes] = await Promise.all([
      client
        .from("region_settings")
        .select("operational_minimums, settings")
        .eq("region_slug", REGION_SETTINGS_SLUG)
        .maybeSingle(),
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
        .gte(
          "start",
          new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .lte(
          "start",
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("start", { ascending: true }),
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (podsRes.error) throw podsRes.error;
    if (rosterRes.error) throw rosterRes.error;
    if (sessionsRes.error) throw sessionsRes.error;

    const overrides = parseRegionOperationalMinimumOverrides(
      (settingsRes.data as any)?.operational_minimums ??
        (settingsRes.data as any)?.settings?.academy?.operational_minimums,
    );
    const definitions: RegionOperationalMinimumDefinition[] =
      buildRegionOperationalMinimums(
        overrides,
        DEFAULT_REGION_OPERATIONAL_MINIMUMS,
      );

    const pods = buildPods(podsRes.data ?? [], rosterRes.data ?? []);
    const members = convertPodsToMemberProgress(pods);

    // Fetch participants for the sessions we care about (if any)
    const sessionIds = (sessionsRes.data ?? []).map((s: any) => s.id).filter(Boolean);
    let participantsMap = new Map<string, any[]>();
    if (sessionIds.length > 0) {
      const { data: participantsRows, error: partsErr } = await client
        .from("academy_participants")
        .select("id, session_id, name, status, understanding")
        .in("session_id", sessionIds);
      if (partsErr) throw partsErr;
      participantsMap = participantsRows?.reduce((map, row) => {
        const list = map.get(row.session_id) ?? [];
        list.push({
          id: row.id,
          name: row.name,
          status: row.status,
          understanding: row.understanding,
        });
        map.set(row.session_id, list);
        return map;
      }, new Map<string, any[]>()) ?? new Map();
    }

    const sessions = mapSessions(sessionsRes.data ?? [], participantsMap);

    const snapshots = evaluateOperationalMinimums(definitions, members);
    const checklist = createRegionReadinessChecklist(snapshots, sessions);
    const score = computeScore(checklist);
    const criticalNeeds = deriveCriticalNeeds(snapshots).slice(0, 5);

    const response: ReadinessPayload = {
      score,
      scoreMethod: "checklist-average",
      checklist,
      criticalNeeds,
      snapshots: snapshots.map((s) => ({
        key: s.key,
        label: s.label,
        coverageStatus: s.coverageStatus,
        activeCount: s.activeCount,
        requiredCount: s.requiredCount,
        inProgressCount: s.inProgressCount,
        expiredCount: s.expiredCount,
        coveragePercent: s.coveragePercent,
      })),
    };

    cached = { data: response, expiresAt: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
