"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { usePodStore } from "@/providers/PodStoreProvider";
import {
  ClassAssignmentContent,
  type InstructorOption,
} from "@workspace/ui/components/academy/ClassAssignmentContent";
import { COURSE_BLUEPRINT } from "@workspace/ui/data/academy/course-blueprint";
import type { AcademyClass } from "@workspace/store/usePodStore";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

type ClassAssignmentDataLayerProps = {
  classId: string;
};

export function ClassAssignmentDataLayer({
  classId,
}: ClassAssignmentDataLayerProps) {
  const router = useRouter();
  const academyClass = usePodStore(
    React.useCallback(
      (state) => state.academyClasses.find((entry) => entry.id === classId),
      [classId],
    ),
  );
  const [hydrating, setHydrating] = React.useState(() => !academyClass);
  // Pods are only used as a fallback for instructor options if DB is empty/unavailable
  const pods = usePodStore((state) => state.pods);
  const updateAcademyClass = usePodStore((state) => state.updateAcademyClass);
  const removeAcademyClass = usePodStore((state) => state.removeAcademyClass);
  const addAcademyClass = usePodStore((state) => state.addAcademyClass);

  // Hydrate this class' server-backed fields (non-destructively) from Supabase
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!classId) return;
      try {
        setHydrating(true);
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("academy_classes")
          .select("*")
          .eq("id", classId)
          .maybeSingle();
        // fetched academy class row
        if (error || !data) return;
        if (cancelled) return;
        const patch = {
          pathwayId: data.pathway_id ?? academyClass?.pathwayId,
          pathwayLabel: data.pathway_label ?? academyClass?.pathwayLabel,
          trackLabel: data.track_label ?? academyClass?.trackLabel,
          variant: data.variant ?? academyClass?.variant,
          title: data.title ?? academyClass?.title,
          description: data.description ?? academyClass?.description,
          modality: (data.modality ??
            academyClass?.modality) as AcademyClass["modality"],
          instructorType: (data.instructor_type ??
            academyClass?.instructorType) as AcademyClass["instructorType"],
          durationHours: (data.duration_hours ??
            academyClass?.durationHours) as number,
          capacity: data.capacity ?? academyClass?.capacity,
          startDate: data.start_date ?? academyClass?.startDate,
          startTime: data.start_time ?? academyClass?.startTime,
          location: data.location ?? academyClass?.location,
          meetingUrl: data.meeting_url ?? academyClass?.meetingUrl,
          notes: data.notes ?? academyClass?.notes,
          instructorName: data.instructor_name ?? academyClass?.instructorName,
          sessionsScheduled: (data.sessions_scheduled ??
            academyClass?.sessionsScheduled ??
            0) as number,
          nextSession: data.next_session ?? academyClass?.nextSession,
          status: (data.status ??
            academyClass?.status) as AcademyClass["status"],
          createdAt:
            data.created_at ??
            academyClass?.createdAt ??
            new Date().toISOString(),
          updatedAt:
            data.updated_at ??
            academyClass?.updatedAt ??
            new Date().toISOString(),
        } as Partial<AcademyClass>;

        if (!academyClass) {
          // If the class doesn't exist locally yet, add it
          const toAdd: AcademyClass = {
            id: data.id,
            pathwayId: (patch.pathwayId ?? "") as string,
            pathwayLabel: (patch.pathwayLabel ?? "") as string,
            trackLabel: patch.trackLabel,
            variant: patch.variant,
            title: (patch.title ?? "Untitled Cohort") as string,
            description: (patch.description ?? "") as string,
            modality: (patch.modality ?? "online") as AcademyClass["modality"],
            instructorType: (patch.instructorType ??
              "expert") as AcademyClass["instructorType"],
            durationHours: (patch.durationHours ?? 0) as number,
            capacity: patch.capacity,
            startDate: patch.startDate,
            startTime: patch.startTime,
            location: patch.location,
            meetingUrl: patch.meetingUrl,
            notes: patch.notes,
            instructorName: patch.instructorName,
            members: [],
            sessions: [],
            sessionsScheduled: (patch.sessionsScheduled ?? 0) as number,
            nextSession: patch.nextSession,
            status: (patch.status ?? "draft") as AcademyClass["status"],
            createdAt: patch.createdAt as string,
            updatedAt: patch.updatedAt as string,
          };
          addAcademyClass(toAdd);
        } else {
          // Merge DB fields non-destructively into existing class
          updateAcademyClass(classId, patch);
        }
      } catch {
        // ignore hydration errors; UI remains functional
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classId, academyClass, updateAcademyClass, addAcademyClass]);

  // Live instructor options from DB, with pods as a fallback
  const [instructorOptions, setInstructorOptions] = React.useState<
    InstructorOption[]
  >([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("academy_instructors")
          .select("*");
        if (error) throw error;
        if (cancelled) return;

        const fromDb: InstructorOption[] = (data ?? []).map((row: any) => ({
          id: String(row.id),
          name: String(row.name ?? "Unknown"),
          type: (row.type ?? "expert") as InstructorOption["type"],
          // Map DB availability to content status type
          status:
            row.availability === "available"
              ? "active"
              : row.availability === "unavailable"
                ? "inactive"
                : (row.availability ?? undefined),
          // DB may not track pod, omit to avoid rendering undefined
          podName: undefined,
        }));

        if (fromDb.length > 0) {
          setInstructorOptions(
            fromDb.sort((a, b) => a.name.localeCompare(b.name)),
          );
          return;
        }
      } catch {
        // fall back to pods below
      }

      // Fallback: derive from pods roster
      const seen = new Set<string>();
      const options: InstructorOption[] = [];
      for (const pod of pods) {
        for (const member of pod.team) {
          if (seen.has(member.id)) continue;
          seen.add(member.id);

          const hasMentorLevel = member.certs?.some(
            (cert) => cert.level === "mentor",
          );
          const dispatchCertified = member.certs?.some(
            (cert) =>
              cert.id.startsWith("dispatch-") && cert.level !== "expired",
          );

          options.push({
            id: member.id,
            name: (
              member.profile?.display_name ??
              member.handle ??
              "Unknown"
            ).toString(),
            type: hasMentorLevel
              ? "mentor"
              : dispatchCertified
                ? "dispatcher"
                : "expert",
            podName: pod.name,
            status: member.status,
          });
        }
      }
      if (!cancelled) {
        setInstructorOptions(
          options.sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pods]);

  const modules = React.useMemo(() => {
    if (!academyClass) return [];
    const blueprint = COURSE_BLUEPRINT.find(
      (pathway) => pathway.id === academyClass.pathwayId,
    );
    return (blueprint?.courses ?? []).map((course) => ({
      slug: course.slug,
      title: course.title,
      durationHours: course.durationHours,
      icon: course.icon,
      type:
        course.type === "qualified" || course.type === "certified"
          ? course.type
          : undefined,
    }));
  }, [academyClass]);

  const handleSave = React.useCallback(
    async (updatedClass: AcademyClass) => {
      if (!academyClass) return;

      updateAcademyClass(updatedClass.id, {
        instructorName: updatedClass.instructorName,
        members: updatedClass.members,
        sessions: updatedClass.sessions,
        sessionsScheduled: updatedClass.sessionsScheduled,
        nextSession: updatedClass.nextSession,
        status: updatedClass.status,
      });
      // Persist core class fields to Supabase
      try {
        const client = getSupabaseBrowserClient();
        const row = {
          id: updatedClass.id,
          pathway_id: updatedClass.pathwayId,
          pathway_label: updatedClass.pathwayLabel,
          track_label: updatedClass.trackLabel,
          variant: updatedClass.variant,
          title: updatedClass.title,
          description: updatedClass.description,
          modality: updatedClass.modality,
          instructor_type: updatedClass.instructorType,
          duration_hours: updatedClass.durationHours,
          capacity: updatedClass.capacity,
          start_date: updatedClass.startDate,
          start_time: updatedClass.startTime,
          location: updatedClass.location,
          meeting_url: updatedClass.meetingUrl,
          notes: updatedClass.notes,
          instructor_name: updatedClass.instructorName,
          sessions_scheduled: updatedClass.sessionsScheduled,
          next_session: updatedClass.nextSession,
          status: updatedClass.status,
        } as const;
        const { error } = await client.from("academy_classes").upsert(row);
        if (error) {
          // Non-blocking; local store already updated
          console.warn("Failed to persist academy class", error);
        }

        // Persist sessions for this class
        try {
          // Fetch existing session ids for this class to compute deletions
          const { data: existing, error: fetchSessionsErr } = await client
            .from("academy_sessions")
            .select("id")
            .eq("class_id", updatedClass.id);
          if (fetchSessionsErr) {
            console.warn("Failed to read existing sessions", fetchSessionsErr);
          }

          const currentIds = new Set(updatedClass.sessions.map((s) => s.id));
          const existingIds = new Set(
            (existing ?? []).map((r: any) => r.id as string),
          );
          const toDelete = (existing ?? [])
            .map((r: any) => r.id as string)
            .filter((id: string) => !currentIds.has(id));

          if (toDelete.length > 0) {
            const { error: delErr } = await client
              .from("academy_sessions")
              .delete()
              .in("id", toDelete);
            if (delErr) {
              console.warn("Failed to delete removed sessions", delErr);
            }
          }

          // Upsert all current sessions
          const sessionRows = updatedClass.sessions.map((s) => {
            const start = s.date ? new Date(s.date) : null;
            const end =
              start && s.durationHours
                ? new Date(start.getTime() + s.durationHours * 60 * 60 * 1000)
                : null;
            return {
              id: s.id,
              class_id: updatedClass.id,
              title: s.label ?? null,
              start: start ? start.toISOString() : null,
              end: end ? end.toISOString() : null,
              modality: updatedClass.modality ?? null,
              location: updatedClass.location ?? null,
              meeting_url: updatedClass.meetingUrl ?? null,
              instructor_name: updatedClass.instructorName ?? null,
              instructor_type: updatedClass.instructorType ?? null,
              status: null as string | null,
              seats: null as any,
              timezone: null as string | null,
              related_topic: s.notes ?? null,
            } as const;
          });

          if (sessionRows.length > 0) {
            const { error: upsertErr } = await client
              .from("academy_sessions")
              .upsert(sessionRows);
            if (upsertErr) {
              console.warn("Failed to upsert sessions", upsertErr);
            }
          }

          // Persist participants per session
          try {
            const sessionIds = updatedClass.sessions.map((s) => s.id);
            if (sessionIds.length > 0) {
              const { data: existingParts, error: fetchPartsErr } = await client
                .from("academy_participants")
                .select("id, session_id")
                .in("session_id", sessionIds);
              if (fetchPartsErr) {
                console.warn(
                  "Failed to read existing participants",
                  fetchPartsErr,
                );
              }

              const existingPartKey = new Set(
                (existingParts ?? []).map(
                  (r: any) => `${r.session_id}:${r.id}`,
                ),
              );
              const desiredPartKey = new Set<string>();
              const participantRows: Array<{
                id: string;
                session_id: string;
                name: string | null;
                signal_handle: string | null;
                understanding: string | null;
                status: string | null;
              }> = [];

              // Build desired rows from UI state
              for (const s of updatedClass.sessions) {
                const rosterById = new Map(
                  updatedClass.members.map((m) => [m.id, m] as const),
                );
                for (const p of s.participants) {
                  const pid = `par_${s.id}__mem_${p.memberId}`;
                  desiredPartKey.add(`${s.id}:${pid}`);
                  const member = rosterById.get(p.memberId);
                  participantRows.push({
                    id: pid,
                    session_id: s.id,
                    name: member?.name ?? null,
                    signal_handle: null,
                    understanding: p.understanding ?? null,
                    status: p.present ? "confirmed" : "waitlist",
                  });
                }
              }

              // Compute deletes: in existing but not desired
              const toDeleteParticipantIds: string[] = [];
              for (const key of existingPartKey) {
                if (!desiredPartKey.has(key)) {
                  const parts = key.split(":");
                  const id = parts[1] ?? "";
                  if (id) toDeleteParticipantIds.push(id);
                }
              }

              if (toDeleteParticipantIds.length > 0) {
                const { error: delPartErr } = await client
                  .from("academy_participants")
                  .delete()
                  .in("id", toDeleteParticipantIds);
                if (delPartErr) {
                  console.warn(
                    "Failed to delete removed participants",
                    delPartErr,
                  );
                }
              }

              if (participantRows.length > 0) {
                const { error: upsertPartErr } = await client
                  .from("academy_participants")
                  .upsert(participantRows);
                if (upsertPartErr) {
                  console.warn("Failed to upsert participants", upsertPartErr);
                }
              }
            }
          } catch (pErr) {
            console.warn("Error persisting participants", pErr);
          }
        } catch (sessErr) {
          console.warn("Error persisting sessions", sessErr);
        }
      } catch (e) {
        console.warn("Error saving academy class", e);
      }

      // Stay on the page after save (no redirect)
    },
    [academyClass, updateAcademyClass],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      removeAcademyClass(id);
      // Delete from Supabase
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from("academy_classes")
          .delete()
          .eq("id", id);
        if (error) {
          console.warn("Failed to delete academy class", error);
        }
      } catch (e) {
        console.warn("Error deleting academy class", e);
      }
      router.push("/academy");
    },
    [removeAcademyClass, router],
  );

  // Hydrate sessions for this class from Supabase when class is ready
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!classId) return;
      if (!academyClass) return; // wait until class exists in store
      // If we've just locally edited sessions, avoid clobbering with hydration immediately
      // Simple guard: if updatedAt changed very recently, skip this cycle
      const justUpdated = (() => {
        if (!academyClass.updatedAt) return false;
        const dt = new Date(academyClass.updatedAt).getTime();
        return Date.now() - dt < 500; // 0.5s window
      })();
      if (justUpdated) return;
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("academy_sessions")
          .select("*")
          .eq("class_id", classId)
          .order("start", { ascending: true });
        // fetched sessions
        if (error) return;
        if (cancelled) return;

        const mapped = (data ?? []).map((row: any, idx: number) => {
          const startIso = row.start
            ? new Date(row.start).toISOString()
            : undefined;
          const endIso = row.end ? new Date(row.end).toISOString() : undefined;
          let durationHours: number | undefined = undefined;
          if (startIso && endIso) {
            const startMs = new Date(startIso).getTime();
            const endMs = new Date(endIso).getTime();
            if (
              !Number.isNaN(startMs) &&
              !Number.isNaN(endMs) &&
              endMs > startMs
            ) {
              durationHours = (endMs - startMs) / (1000 * 60 * 60);
            }
          }
          return {
            id: String(row.id),
            label: (row.title ?? `Session ${idx + 1}`) as string,
            date: startIso,
            durationHours,
            notes: (row.related_topic ?? undefined) as string | undefined,
            participants: [],
          };
        });

        // Hydrate participants for all sessions in one query
        const sessionIds = mapped.map((s) => s.id);
        let participantsBySession = new Map<
          string,
          ReturnType<typeof Array.prototype.slice>
        >();
        // Track any member ids/names discovered from participants so we can ensure roster contains them
        const discoveredMemberNamesById = new Map<string, string>();
        if (sessionIds.length > 0) {
          const { data: parts, error: partsErr } = await client
            .from("academy_participants")
            .select("*")
            .in("session_id", sessionIds);
          if (!partsErr) {
            const rosterByName = new Map(
              (academyClass.members ?? []).map((m) => [m.name, m.id] as const),
            );
            const toMemberId = (
              rowId: string,
              name: string | null,
            ): string | null => {
              // Prefer deriving memberId from our synthetic id format
              const m = rowId.match(/^par_(.+)__mem_(.+)$/);
              if (m && m[2]) return m[2];
              // Fallback: try exact name match to roster
              if (name && rosterByName.has(name))
                return rosterByName.get(name)!;
              return null;
            };
            participantsBySession = new Map<string, any[]>();
            for (const row of parts ?? []) {
              const memberId = toMemberId(String(row.id), row.name);
              if (!memberId) continue; // only hydrate if we can tie to a roster member
              if (row.name) {
                // Remember the name we saw for potential roster upsert
                if (!discoveredMemberNamesById.has(memberId)) {
                  discoveredMemberNamesById.set(memberId, String(row.name));
                }
              }
              const entry = {
                memberId,
                present: row.status === "confirmed",
                engagement: "medium" as const, // not stored in DB; default
                understanding: (row.understanding ?? "building") as
                  | "needs_support"
                  | "building"
                  | "confident",
                notes: undefined,
              };
              const key = String(row.session_id);
              const list = participantsBySession.get(key) ?? [];
              list.push(entry);
              participantsBySession.set(key, list);
            }
          }
        }

        const merged = mapped.map((s) => ({
          ...s,
          participants: participantsBySession.get(s.id) ?? [],
        }));

        // Skip store update if nothing changed to avoid triggering effect loops
        const sessionSig = (arr: typeof merged) =>
          JSON.stringify(
            arr
              .map((x) => ({
                id: x.id,
                label: x.label,
                date: x.date ?? null,
                durationHours: x.durationHours ?? null,
                notes: x.notes ?? null,
                participants: [...(x.participants ?? [])]
                  .map((p) => ({
                    memberId: p.memberId,
                    present: p.present,
                    engagement: p.engagement,
                    understanding: p.understanding,
                  }))
                  .sort((a, b) => a.memberId.localeCompare(b.memberId)),
              }))
              .sort((a, b) => a.id.localeCompare(b.id)),
          );
        const current = academyClass.sessions ?? [];
        const currentSig = sessionSig(current as any);
        const mergedSig = sessionSig(merged as any);

        // Compute roster upserts from discovered participants
        const existingMembers = academyClass.members ?? [];
        const existingIds = new Set(existingMembers.map((m) => m.id));
        const toAddMembers: Array<{
          id: string;
          name: string;
          participationCount: number;
        }> = [];
        for (const [mid, name] of discoveredMemberNamesById) {
          if (!existingIds.has(mid)) {
            toAddMembers.push({
              id: mid,
              name: name || "Unknown",
              participationCount: 0,
            });
          }
        }

        const patch: Partial<AcademyClass> = {} as any;
        if (currentSig !== mergedSig) {
          (patch as any).sessions = merged;
        }
        if (toAddMembers.length > 0) {
          (patch as any).members = [...existingMembers, ...toAddMembers];
        }
        // Preserve updatedAt to avoid unintentionally stamping a new client timestamp
        // which can flip state and re-trigger the class hydration effect.
        if (academyClass?.updatedAt) {
          (patch as any).updatedAt = academyClass.updatedAt;
        }
        if (Object.keys(patch).length > 0) {
          updateAcademyClass(classId, patch);
        }
      } catch (e) {
        console.warn("Failed to hydrate sessions", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classId, updateAcademyClass, academyClass]);

  if (!academyClass && hydrating) {
    return null;
  }

  return (
    <ClassAssignmentContent
      classId={classId}
      academyClass={academyClass}
      instructorOptions={instructorOptions}
      modules={modules}
      onSave={handleSave}
      onDelete={handleDelete}
      onBackToAcademy={() => router.push("/academy")}
      onGoBack={() => router.back()}
      onCreateNewClass={() => router.push("/academy")}
    />
  );
}
