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

  // Hydrate this class' server-backed fields (non-destructively) from API
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!classId) return;
      try {
        setHydrating(true);
        const res = await fetch(`/api/academy/class/${classId}`);
        if (!res.ok) return;
        const { class: data, sessions: sessionsData, participants: participantsData } = await res.json();

        if (!data) return;
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

        // Process sessions and participants
        const mappedSessions = (sessionsData ?? []).map((row: any, idx: number) => {
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

          // Find participants for this session
          const sessionParticipants = (participantsData ?? [])
            .filter((p: any) => p.session_id === row.id)
            .map((row: any) => {
              // Extract memberId from synthetic id if possible
              const m = row.id.match(/^par_(.+)__mem_(.+)$/);
              let memberId = m && m[2] ? m[2] : null;

              // Fallback: try exact name match to roster if we have the class loaded
              if (!memberId && row.name && academyClass?.members) {
                const found = academyClass.members.find(mem => mem.name === row.name);
                if (found) memberId = found.id;
              }

              return {
                memberId: memberId,
                present: row.status === "confirmed",
                engagement: "medium" as const,
                understanding: (row.understanding ?? "building") as "needs_support" | "building" | "confident",
                notes: undefined,
                name: row.name // Keep name for roster update check
              };
            })
            .filter((p: any) => p.memberId); // Filter out those we couldn't link

          return {
            id: String(row.id),
            label: (row.title ?? `Session ${idx + 1}`) as string,
            date: startIso,
            durationHours,
            notes: (row.related_topic ?? undefined) as string | undefined,
            participants: sessionParticipants.map((p: any) => ({
              memberId: p.memberId,
              present: p.present,
              engagement: p.engagement,
              understanding: p.understanding,
            })),
          };
        });

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
            members: [], // Will be populated if we process roster updates, but for now empty or existing logic
            sessions: mappedSessions,
            sessionsScheduled: (patch.sessionsScheduled ?? 0) as number,
            nextSession: patch.nextSession,
            status: (patch.status ?? "draft") as AcademyClass["status"],
            createdAt: patch.createdAt as string,
            updatedAt: patch.updatedAt as string,
          };

          // Roster updates from participants
          const existingMembers = toAdd.members ?? [];
          const existingIds = new Set(existingMembers.map((m) => m.id));
          const toAddMembers: any[] = [];

          // We need to check all participants for new members
          // But since we filtered participants by memberId, we might have missed some if we couldn't link them.
          // However, the original logic relied on `discoveredMemberNamesById`.
          // Let's replicate that logic briefly.
          const discoveredMemberNamesById = new Map<string, string>();
          (participantsData ?? []).forEach((row: any) => {
            const m = row.id.match(/^par_(.+)__mem_(.+)$/);
            if (m && m[2] && row.name) {
              discoveredMemberNamesById.set(m[2], row.name);
            }
          });

          for (const [mid, name] of discoveredMemberNamesById) {
            if (!existingIds.has(mid)) {
              toAddMembers.push({
                id: mid,
                name: name || "Unknown",
                participationCount: 0,
              });
            }
          }

          if (toAddMembers.length > 0) {
            toAdd.members = [...existingMembers, ...toAddMembers];
          }

          addAcademyClass(toAdd);
        } else {
          // Merge DB fields non-destructively into existing class

          // Check if we should update sessions
          // Skip store update if nothing changed to avoid triggering effect loops
          const sessionSig = (arr: any[]) =>
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
          const currentSig = sessionSig(current);
          const mergedSig = sessionSig(mappedSessions);

          if (currentSig !== mergedSig) {
            (patch as any).sessions = mappedSessions;
          }

          // Roster updates
          const existingMembers = academyClass.members ?? [];
          const existingIds = new Set(existingMembers.map((m) => m.id));
          const toAddMembers: any[] = [];
          const discoveredMemberNamesById = new Map<string, string>();
          (participantsData ?? []).forEach((row: any) => {
            const m = row.id.match(/^par_(.+)__mem_(.+)$/);
            if (m && m[2] && row.name) {
              discoveredMemberNamesById.set(m[2], row.name);
            }
          });
          for (const [mid, name] of discoveredMemberNamesById) {
            if (!existingIds.has(mid)) {
              toAddMembers.push({
                id: mid,
                name: name || "Unknown",
                participationCount: 0,
              });
            }
          }
          if (toAddMembers.length > 0) {
            (patch as any).members = [...existingMembers, ...toAddMembers];
          }

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
        const res = await fetch("/api/academy/instructors");
        if (!res.ok) throw new Error("Failed to fetch instructors");
        const data = await res.json();

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

      // Persist to API
      try {
        const res = await fetch("/api/academy/class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedClass),
        });

        if (!res.ok) {
          console.warn("Failed to persist academy class");
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
      // Delete from API
      try {
        const res = await fetch(`/api/academy/class/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          console.warn("Failed to delete academy class");
        }
      } catch (e) {
        console.warn("Error deleting academy class", e);
      }
      router.push("/academy");
    },
    [removeAcademyClass, router],
  );

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
