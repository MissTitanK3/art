"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@workspace/ui/components/sonner";

import { usePodStore } from "@/providers/PodStoreProvider";
import { Button } from "@workspace/ui/components/button";
import { PodAcademyDashboardLayout } from "@workspace/ui/layout/pods/PodAcademyDashboardLayout";
import { COURSE_BLUEPRINT } from "@workspace/ui/data/academy/course-blueprint";
import type {
  AcademyCourseGroup,
  AcademyInstructorProfile,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademySummaryStat,
  AcademyMemberProgress,
} from "@workspace/store/types/academy.ts";
import {
  PodAcademyDashboardStoreProvider,
  usePodAcademyDashboardStore,
} from "@/providers/PodAcademyDashboardStoreProvider";
import {
  attachCourseStatusToGroups,
  convertPodsToMemberProgress,
  deriveStats,
} from "@/lib/utils";
import type { AcademyTrainingSessionParticipant } from "@workspace/store/types/academy.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { useProfileStore } from "@workspace/store/useProfileStore";
import type {
  RegionOperationalMinimumDefinition,
  RegionOperationalMinimumsOverridesPayload,
} from "@workspace/store/types/academy-readiness.ts";
import {
  DEFAULT_REGION_OPERATIONAL_MINIMUMS,
  buildRegionOperationalMinimums,
  createRegionReadinessChecklist,
  evaluateOperationalMinimums,
  deriveRegionOperationalMinimumOverrides,
  parseRegionOperationalMinimumOverrides,
} from "@/lib/academy/region-minimums";

const REGION_SETTINGS_SLUG =
  process.env.NEXT_PUBLIC_REGION_ID ||
  process.env.NEXT_PUBLIC_BRAND_SLUG ||
  "default";

type RegionSettingsRow = {
  id?: string;
  region_slug?: string;
  settings?: Record<string, any> | null;
  operational_minimums?: unknown;
  updated_at?: string;
};

export default function AcademyDashboardPage() {
  const router = useRouter();
  const pods = usePodStore((state) => state.pods);
  // Using Supabase-backed classes; do not pull from local pod store

  const members = useMemo(() => convertPodsToMemberProgress(pods), [pods]);
  const stats = useMemo(() => deriveStats(pods, members, []), [pods, members]);

  const courseGroups: AcademyCourseGroup[] = useMemo(
    () => attachCourseStatusToGroups(COURSE_BLUEPRINT, members),
    [members]
  );

  const headingCta = (
    <Button asChild variant="outline">
      <a
        href="https://academy.alwaysreadytools.org/courses"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Academy
      </a>
    </Button>
  );

  const heading = {
    title: "Dispatch Academy Hub",
    subtitle:
      "Coordinate live classes with mentors and dispatchers while tracking qualification progress in every pod.",
    cta: headingCta,
  };

  return (
    <PodAcademyDashboardStoreProvider
      initialStats={stats}
      initialCourseGroups={courseGroups}
      initialMembers={members}
      initialInstructors={[]}
      initialTrainingClasses={[]}
      initialSessions={[]}
    >
      <AcademyDashboardContent
        heading={heading}
        stats={stats}
        courseGroups={courseGroups}
        members={members}
        onScheduleClass={(classId) => {
          router.push(`/academy/class/${classId}`);
        }}
        onCreatePathwayClass={(pathwayId) => {
          router.push(`/academy/class/${pathwayId}`);
        }}
      />
    </PodAcademyDashboardStoreProvider>
  );
}

type AcademyDashboardContentProps = {
  heading: {
    title: string;
    subtitle: string;
    cta?: React.ReactNode;
  };
  stats: AcademySummaryStat[];
  courseGroups: AcademyCourseGroup[];
  members: AcademyMemberProgress[];
  onScheduleClass: (classId: string) => void;
  onCreatePathwayClass: (pathwayId: string) => void;
};

function AcademyDashboardContent({
  heading,
  stats,
  courseGroups,
  members,
  onScheduleClass,
  onCreatePathwayClass,
}: AcademyDashboardContentProps) {
  const setStats = usePodAcademyDashboardStore((state) => state.setStats);
  const setCourseGroups = usePodAcademyDashboardStore(
    (state) => state.setCourseGroups
  );
  const setMembers = usePodAcademyDashboardStore((state) => state.setMembers);
  const addInstructor = usePodAcademyDashboardStore(
    (state) => state.addInstructor
  );
  const updateInstructor = usePodAcademyDashboardStore(
    (state) => state.updateInstructor
  );
  const removeInstructor = usePodAcademyDashboardStore(
    (state) => state.removeInstructor
  );
  const addTrainingSession = usePodAcademyDashboardStore(
    (state) => state.addTrainingSession
  );
  const updateTrainingSessionStatus = usePodAcademyDashboardStore(
    (state) => state.updateTrainingSessionStatus
  );
  const patchTrainingSession = usePodAcademyDashboardStore(
    (state) => state.updateTrainingSession
  );
  const removeTrainingSession = usePodAcademyDashboardStore(
    (state) => state.removeTrainingSession
  );
  const [operationalMinimumDefinitions, setOperationalMinimumDefinitions] =
    React.useState(() =>
      DEFAULT_REGION_OPERATIONAL_MINIMUMS.map((definition) => ({
        ...definition,
      }))
    );
  const [regionSettingsRecord, setRegionSettingsRecord] =
    React.useState<RegionSettingsRow | null>(null);
  const [isSavingMinimums, setIsSavingMinimums] = React.useState(false);

  useEffect(() => {
    setStats(stats);
    setCourseGroups(courseGroups);
    setMembers(members);
  }, [courseGroups, members, setCourseGroups, setMembers, setStats, stats]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadOperationalMinimumOverrides() {
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("region_settings")
          .select("id, region_slug, operational_minimums, settings, updated_at")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;

        const row = (data ?? null) as RegionSettingsRow | null;
        const overridesPayload =
          row?.operational_minimums ??
          row?.settings?.operational_minimums ??
          row?.settings?.academy?.operational_minimums;

        const overrides = parseRegionOperationalMinimumOverrides(
          overridesPayload as RegionOperationalMinimumsOverridesPayload
        );
        if (!cancelled && overrides.length > 0) {
          setOperationalMinimumDefinitions(
            buildRegionOperationalMinimums(overrides)
          );
        }
        if (!cancelled) {
          setRegionSettingsRecord(row);
        }
      } catch (overrideError) {
        console.warn(
          "[AcademyDashboard] region operational minimum overrides unavailable",
          overrideError
        );
      }
    }

    loadOperationalMinimumOverrides();

    return () => {
      cancelled = true;
    };
  }, []);

  // Supabase: hydrate sessions + participants and persist changes
  const supabaseSetSessions = usePodAcademyDashboardStore(
    (state) => state.setSessions
  );
  const supabaseSetInstructors = usePodAcademyDashboardStore(
    (state) => state.setInstructors
  );
  const supabaseSetClasses = usePodAcademyDashboardStore(
    (state) => state.setTrainingClasses
  );

  function mapRowToSession(
    row: Record<string, unknown>,
    participantsBySession: Record<string, AcademyTrainingSessionParticipant[]>
  ): AcademyTrainingSession {
    const r = row as Record<string, any>;
    const participants = participantsBySession[String(r.id)] ?? [];
    const derivedConfirmed = participants.filter(
      (p) => p.status === "confirmed"
    ).length;
    const derivedWaitlist = participants.filter(
      (p) => p.status === "waitlist"
    ).length;
    const seatsFromDb: Partial<{
      capacity: number;
      confirmed: number;
      waitlist: number;
    }> | null =
      r.seats && typeof r.seats === "object" ? (r.seats as any) : null;
    const seats = {
      capacity: Number(seatsFromDb?.capacity ?? 0),
      confirmed: Number.isFinite(Number(seatsFromDb?.confirmed))
        ? Number(seatsFromDb?.confirmed)
        : derivedConfirmed,
      waitlist: Number.isFinite(Number(seatsFromDb?.waitlist))
        ? Number(seatsFromDb?.waitlist)
        : derivedWaitlist,
    } as const;

    return {
      id: String(r.id),
      classId: r.class_id ? String(r.class_id) : "",
      title: String((r.title ?? "Untitled Session") as string),
      start: String(r.start),
      end: String(r.end),
      modality: (r.modality as AcademyTrainingSession["modality"]) ?? "online",
      location: typeof r.location === "string" ? r.location : undefined,
      meetingUrl: typeof r.meeting_url === "string" ? r.meeting_url : undefined,
      instructorName: String((r.instructor_name ?? "TBD") as string),
      instructorType:
        (r.instructor_type as AcademyTrainingSession["instructorType"]) ??
        "expert",
      status: (r.status as AcademyTrainingSession["status"]) ?? "scheduled",
      seats,
      timezone: typeof r.timezone === "string" ? r.timezone : undefined,
      relatedTopic:
        typeof r.related_topic === "string" ? r.related_topic : undefined,
      participants,
    } as AcademyTrainingSession;
  }

  const fetchSessionsFromDatabase =
    React.useCallback(async (): Promise<void> => {
      try {
        const client = getSupabaseBrowserClient();
        const [
          { data: sessions, error: sErr },
          { data: participants, error: pErr },
        ] = await Promise.all([
          client
            .from("academy_sessions")
            .select("*")
            .order("start", { ascending: true }),
          client.from("academy_participants").select("*"),
        ]);
        if (sErr) throw sErr;
        if (pErr) throw pErr;

        const partsBySession: Record<
          string,
          AcademyTrainingSessionParticipant[]
        > = {};
        for (const p of participants ?? []) {
          const sid = String(p.session_id);
          if (!partsBySession[sid]) partsBySession[sid] = [];
          partsBySession[sid]!.push({
            id: String(p.id),
            name: String(p.name ?? ""),
            signalHandle: p.signal_handle ?? undefined,
            understanding: p.understanding ?? "building",
            status: p.status ?? "confirmed",
          });
        }

        const mapped = (sessions ?? []).map((row) =>
          mapRowToSession(row as Record<string, unknown>, partsBySession)
        );
        supabaseSetSessions(mapped);
      } catch (e) {
        console.warn("[AcademyDashboard] supabase fetch sessions error", e);
      }
    }, [supabaseSetSessions]);

  // moved after callback declarations for init order

  const persistSessionToDatabase = React.useCallback(
    async (session: AcademyTrainingSession): Promise<void> => {
      try {
        const client = getSupabaseBrowserClient();
        const payload = {
          id: session.id,
          class_id:
            session.classId && session.classId.length > 0
              ? session.classId
              : null,
          title: session.title,
          start: session.start,
          end: session.end,
          modality: session.modality,
          location: session.location,
          meeting_url: session.meetingUrl,
          instructor_name: session.instructorName,
          instructor_type: session.instructorType,
          status: session.status,
          seats: session.seats,
          timezone: session.timezone,
          related_topic: session.relatedTopic,
        } as const;
        const { error } = await client.from("academy_sessions").upsert(payload);
        if (error) throw error;
      } catch (e) {
        console.warn("[AcademyDashboard] supabase upsert session failed", e);
      }
    },
    []
  );

  const persistParticipantsForSession = React.useCallback(
    async (
      sessionId: string,
      participantsList: AcademyTrainingSessionParticipant[]
    ): Promise<void> => {
      try {
        const client = getSupabaseBrowserClient();
        // Replace set for simplicity
        const del = await client
          .from("academy_participants")
          .delete()
          .eq("session_id", sessionId);
        if (del.error) throw del.error;
        if (participantsList.length === 0) return;
        const rows = participantsList.map((p) => ({
          id: p.id,
          session_id: sessionId,
          name: p.name,
          signal_handle: p.signalHandle ?? null,
          understanding: p.understanding,
          status: p.status,
        }));
        const ins = await client.from("academy_participants").insert(rows);
        if (ins.error) throw ins.error;
      } catch (e) {
        console.warn(
          "[AcademyDashboard] supabase replace participants failed",
          e
        );
      }
    },
    []
  );

  // Instructors
  const mapRowToInstructor = React.useCallback(
    (row: Record<string, unknown>): AcademyInstructorProfile => {
      const r = row as Record<string, any>;
      const rawCerts = Array.isArray(r.certifications) ? r.certifications : [];
      const certifications = rawCerts
        .map((c: any) => {
          if (c && typeof c === "object" && "id" in c) {
            return {
              id: String((c as any).id),
              display_name: String(
                (c as any).display_name ?? (c as any).id ?? ""
              ),
              level:
                typeof (c as any).level === "string"
                  ? (c as any).level
                  : undefined,
            };
          }
          if (typeof c === "string") {
            return { id: c, display_name: c };
          }
          return null;
        })
        .filter(Boolean) as AcademyInstructorProfile["certifications"];

      const reg =
        typeof r.registration_status === "string"
          ? r.registration_status
          : "pending";
      const vet =
        typeof r.vetting_status === "string"
          ? r.vetting_status
          : "awaiting_verification";
      return {
        id: String(r.id),
        name: String((r.name ?? "Unknown") as string),
        type: (r.type as AcademyInstructorProfile["type"]) ?? "expert",
        focus: String((r.focus ?? "General") as string),
        availability:
          (r.availability as AcademyInstructorProfile["availability"]) ??
          "available",
        timezone: typeof r.timezone === "string" ? r.timezone : undefined,
        certifications,
        registrationStatus:
          reg as AcademyInstructorProfile["registrationStatus"],
        vettingStatus: vet as AcademyInstructorProfile["vettingStatus"],
      };
    },
    []
  );

  const fetchInstructorsFromDatabase =
    React.useCallback(async (): Promise<void> => {
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("academy_instructors")
          .select("*");
        if (error) throw error;
        const mapped = (data ?? []).map(mapRowToInstructor);
        supabaseSetInstructors(mapped);
      } catch (e) {
        console.warn("[AcademyDashboard] supabase fetch instructors error", e);
      }
    }, [mapRowToInstructor, supabaseSetInstructors]);

  // Classes
  const mapRowToClass = React.useCallback(
    (row: Record<string, unknown>): AcademyTrainingClass => {
      const r = row as Record<string, any>;
      return {
        id: String(r.id),
        title: String((r.title ?? "") as string),
        description: String((r.description ?? "") as string),
        track: String((r.pathway_label ?? "") as string),
        modality: (r.modality as AcademyTrainingClass["modality"]) ?? "online",
        instructorType:
          (r.instructor_type as AcademyTrainingClass["instructorType"]) ??
          "dispatcher",
        durationHours: Number(r.duration_hours ?? 0),
        sessionsScheduled: Number(r.sessions_scheduled ?? 0),
        nextSession:
          typeof r.next_session === "string" ? r.next_session : undefined,
        status: (r.status as AcademyTrainingClass["status"]) ?? "draft",
      };
    },
    []
  );

  const fetchClassesFromDatabase =
    React.useCallback(async (): Promise<void> => {
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("academy_classes")
          .select("*")
          .order("updated_at", { ascending: false });
        if (error) throw error;
        const mapped = (data ?? []).map(mapRowToClass);
        supabaseSetClasses(mapped);
      } catch (e) {
        console.warn("[AcademyDashboard] supabase fetch classes error", e);
      }
    }, [mapRowToClass, supabaseSetClasses]);

  // Hydrate from Supabase once callbacks are ready
  useEffect(() => {
    fetchSessionsFromDatabase();
    fetchInstructorsFromDatabase();
    fetchClassesFromDatabase();
  }, [
    fetchSessionsFromDatabase,
    fetchInstructorsFromDatabase,
    fetchClassesFromDatabase,
  ]);

  const storeStats = usePodAcademyDashboardStore((state) => state.stats);
  const storeCourseGroups = usePodAcademyDashboardStore(
    (state) => state.courseGroups
  );
  const storeMembers = usePodAcademyDashboardStore((state) => state.members);
  const storeInstructors = usePodAcademyDashboardStore(
    (state) => state.instructors
  );
  const storeTrainingClasses = usePodAcademyDashboardStore(
    (state) => state.trainingClasses
  );
  const storeSessions = usePodAcademyDashboardStore((state) => state.sessions);
  const operationalMinimumSnapshots = React.useMemo(
    () =>
      evaluateOperationalMinimums(operationalMinimumDefinitions, storeMembers),
    [operationalMinimumDefinitions, storeMembers]
  );
  const readinessChecklist = React.useMemo(
    () =>
      createRegionReadinessChecklist(
        operationalMinimumSnapshots,
        storeSessions
      ),
    [operationalMinimumSnapshots, storeSessions]
  );
  const notifyAcademyChange = React.useCallback(
    async (payload: {
      id: string;
      type: "class" | "session";
      action: "create" | "update";
      title?: string;
      link?: string;
    }) => {
      try {
        const res = await fetch("/api/academy/notifications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn(
            "[AcademyDashboard] notification request failed",
            text || res.status
          );
        }
      } catch (notifyErr) {
        console.warn(
          "[AcademyDashboard] notification request error",
          notifyErr
        );
      }
    },
    []
  );
  const refreshReadinessCache = React.useCallback(async () => {
    try {
      await fetch("/api/academy/readiness?refresh=true", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
    } catch (err) {
      console.warn(
        "[AcademyDashboard] readiness cache refresh failed",
        err
      );
    }
  }, []);
  const profile = useProfileStore((s) => s.profile);
  const roles = profile?.access_role ? [String(profile.access_role)] : [];

  const handleSaveOperationalMinimums = React.useCallback(
    async (definitions: RegionOperationalMinimumDefinition[]) => {
      setIsSavingMinimums(true);
      try {
        const client = getSupabaseBrowserClient();
        const overrides = deriveRegionOperationalMinimumOverrides(
          definitions,
          DEFAULT_REGION_OPERATIONAL_MINIMUMS
        );

        const existingSettings = (regionSettingsRecord?.settings ??
          {}) as Record<string, any>;
        const nextSettings = {
          ...existingSettings,
          academy: {
            ...(existingSettings?.academy ?? {}),
            operational_minimums: overrides,
          },
        };

        const payload: RegionSettingsRow = {
          id: regionSettingsRecord?.id,
          region_slug:
            regionSettingsRecord?.region_slug || REGION_SETTINGS_SLUG,
          operational_minimums: overrides,
          settings: nextSettings,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await client
          .from("region_settings")
          .upsert(payload, { onConflict: "region_slug" })
          .select("id, region_slug, operational_minimums, settings, updated_at")
          .single();
        if (error) throw error;

        const nextRecord = (data as RegionSettingsRow) ?? payload;
        setRegionSettingsRecord(nextRecord);
        setOperationalMinimumDefinitions(
          definitions.map((definition) => ({ ...definition }))
        );
        toast.success("Operational minimums updated");
      } catch (error) {
        console.error(
          "[AcademyDashboard] unable to save operational minimums",
          error
        );
        toast.error("Failed to save operational minimums");
        throw error;
      } finally {
        setIsSavingMinimums(false);
      }
    },
    [regionSettingsRecord]
  );

  return (
    <PodAcademyDashboardLayout
      roles={roles}
      heading={heading}
      stats={storeStats}
      courseGroups={storeCourseGroups}
      members={storeMembers}
      instructors={storeInstructors}
      trainingClasses={storeTrainingClasses}
      sessions={storeSessions}
      operationalMinimums={operationalMinimumSnapshots}
      operationalMinimumDefinitions={operationalMinimumDefinitions}
      readinessChecklist={readinessChecklist}
      onSaveOperationalMinimums={handleSaveOperationalMinimums}
      isSavingOperationalMinimums={isSavingMinimums}
      onScheduleClass={onScheduleClass}
      onUpdateSessionStatus={async (sessionId, status) => {
        const targetSession = storeSessions.find((s) => s.id === sessionId);
        const previousStatus = targetSession?.status ?? "scheduled";
        updateTrainingSessionStatus(sessionId, status);
        try {
          const res = await fetch(`/api/academy/sessions/${sessionId}/status`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status }),
          });
          if (!res.ok) {
            const details = await res.text().catch(() => "");
            throw new Error(details || "Failed to update session status");
          }
          await notifyAcademyChange({
            id: sessionId,
            type: "session",
            action: "update",
            title: targetSession?.title,
            link:
              targetSession?.classId && targetSession.classId.length > 0
                ? `/academy/class/${targetSession.classId}`
                : "/academy",
          });
          await refreshReadinessCache();
        } catch (e) {
          updateTrainingSessionStatus(sessionId, previousStatus);
          console.info(
            "[AcademyDashboard] status update local-only (no supabase)",
            e
          );
          toast.error("Unable to update session status");
        }
      }}
      onCreateInstructor={async (draft) => {
        // Optimistic create in local store, then persist
        const instructor = addInstructor(draft);
        console.info("Added instructor", instructor.id);
        try {
          const client = getSupabaseBrowserClient();
          const payload = {
            id: instructor.id,
            name: instructor.name,
            type: instructor.type,
            focus: instructor.focus,
            availability: instructor.availability,
            timezone: instructor.timezone ?? null,
            certifications: instructor.certifications ?? [],
            registration_status: instructor.registrationStatus,
            vetting_status: instructor.vettingStatus,
          } as const;
          const { error } = await client
            .from("academy_instructors")
            .upsert(payload);
          if (error) throw error;
        } catch (e) {
          console.warn(
            "[AcademyDashboard] supabase upsert instructor failed",
            e
          );
        }
      }}
      onUpdateInstructor={async (instructorId, patch) => {
        updateInstructor(instructorId, patch);
        console.info("Updated instructor", instructorId, patch);
        try {
          const client = getSupabaseBrowserClient();
          const payload: Record<string, any> = {
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.type !== undefined ? { type: patch.type } : {}),
            ...(patch.focus !== undefined ? { focus: patch.focus } : {}),
            ...(patch.availability !== undefined
              ? { availability: patch.availability }
              : {}),
            ...(patch.timezone !== undefined
              ? { timezone: patch.timezone ?? null }
              : {}),
            ...(patch.certifications !== undefined
              ? { certifications: patch.certifications ?? [] }
              : {}),
            ...(patch.registrationStatus !== undefined
              ? { registration_status: patch.registrationStatus }
              : {}),
            ...(patch.vettingStatus !== undefined
              ? { vetting_status: patch.vettingStatus }
              : {}),
          };
          if (Object.keys(payload).length > 0) {
            const { error } = await client
              .from("academy_instructors")
              .update(payload)
              .eq("id", instructorId);
            if (error) throw error;
          }
        } catch (e) {
          console.warn(
            "[AcademyDashboard] supabase update instructor failed",
            e
          );
        }
      }}
      onDeleteInstructor={async (instructorId) => {
        removeInstructor(instructorId);
        console.info("Removed instructor", instructorId);
        try {
          const client = getSupabaseBrowserClient();
          const { error } = await client
            .from("academy_instructors")
            .delete()
            .eq("id", instructorId);
          if (error) throw error;
        } catch (e) {
          console.warn(
            "[AcademyDashboard] supabase delete instructor failed",
            e
          );
        }
      }}
      onCreatePathwayClass={onCreatePathwayClass}
      onCreateTrainingSession={async (draft) => {
        const session = addTrainingSession(draft);
        console.info("Created training session", session.id);
        await persistSessionToDatabase(session);
        await persistParticipantsForSession(
          session.id,
          session.participants ?? []
        );
        await notifyAcademyChange({
          id: session.id,
          type: "session",
          action: "create",
          title: session.title,
          link:
            session.classId && session.classId.length > 0
              ? `/academy/class/${session.classId}`
              : "/academy",
        });
        await refreshReadinessCache();
      }}
      onUpdateTrainingSession={async (sessionId, patch) => {
        patchTrainingSession(sessionId, patch);
        console.info("Updated training session", sessionId, patch);
        const current = storeSessions.find((s) => s.id === sessionId);
        if (current) {
          const next: AcademyTrainingSession = {
            ...current,
            ...patch,
            seats: patch.seats
              ? { ...current.seats, ...patch.seats }
              : current.seats,
            participants: patch.participants
              ? (patch.participants as AcademyTrainingSessionParticipant[])
              : current.participants,
          } as AcademyTrainingSession;
          await persistSessionToDatabase(next);
          if (patch.participants) {
            await persistParticipantsForSession(
              sessionId,
              next.participants ?? []
            );
          }
          await notifyAcademyChange({
            id: sessionId,
            type: "session",
            action: "update",
            title: next.title,
            link:
              next.classId && next.classId.length > 0
                ? `/academy/class/${next.classId}`
                : "/academy",
          });
          await refreshReadinessCache();
        }
      }}
      onDeleteTrainingSession={async (sessionId) => {
        removeTrainingSession(sessionId);
        console.info("Deleted training session", sessionId);
        try {
          const client = getSupabaseBrowserClient();
          await client.from("academy_sessions").delete().eq("id", sessionId); // cascade deletes participants
          await refreshReadinessCache();
        } catch (e) {
          console.info(
            "[AcademyDashboard] delete session local-only (no supabase)",
            e
          );
        }
      }}
    />
  );
}
