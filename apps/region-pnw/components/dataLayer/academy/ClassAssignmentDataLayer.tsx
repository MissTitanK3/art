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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ClassAssignmentDataLayerProps = {
  classId: string;
};

export function ClassAssignmentDataLayer({ classId }: ClassAssignmentDataLayerProps) {
  const router = useRouter();
  const academyClass = usePodStore(
    React.useCallback(
      (state) => state.academyClasses.find((entry) => entry.id === classId),
      [classId],
    ),
  );
  // Pods are only used as a fallback for instructor options if DB is empty/unavailable
  const pods = usePodStore((state) => state.pods);
  const updateAcademyClass = usePodStore((state) => state.updateAcademyClass);
  const removeAcademyClass = usePodStore((state) => state.removeAcademyClass);

  // Hydrate this class' server-backed fields (non-destructively) from Supabase
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!classId) return;
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client
          .from("academy_classes")
          .select("*")
          .eq("id", classId)
          .maybeSingle();
        if (error || !data) return;
        if (cancelled) return;
        updateAcademyClass(classId, {
          pathwayId: data.pathway_id ?? academyClass?.pathwayId,
          pathwayLabel: data.pathway_label ?? academyClass?.pathwayLabel,
          trackLabel: data.track_label ?? academyClass?.trackLabel,
          variant: data.variant ?? academyClass?.variant,
          title: data.title ?? academyClass?.title,
          description: data.description ?? academyClass?.description,
          modality: data.modality ?? academyClass?.modality,
          instructorType: data.instructor_type ?? academyClass?.instructorType,
          durationHours: data.duration_hours ?? academyClass?.durationHours,
          capacity: data.capacity ?? academyClass?.capacity,
          startDate: data.start_date ?? academyClass?.startDate,
          startTime: data.start_time ?? academyClass?.startTime,
          location: data.location ?? academyClass?.location,
          meetingUrl: data.meeting_url ?? academyClass?.meetingUrl,
          notes: data.notes ?? academyClass?.notes,
          instructorName: data.instructor_name ?? academyClass?.instructorName,
          sessionsScheduled: data.sessions_scheduled ?? academyClass?.sessionsScheduled ?? 0,
          nextSession: data.next_session ?? academyClass?.nextSession,
          status: data.status ?? academyClass?.status,
        });
      } catch {
        // ignore hydration errors; UI remains functional
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classId, updateAcademyClass]);

  // Live instructor options from DB, with pods as a fallback
  const [instructorOptions, setInstructorOptions] = React.useState<InstructorOption[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = getSupabaseBrowserClient();
        const { data, error } = await client.from("academy_instructors").select("*");
        if (error) throw error;
        if (cancelled) return;

        const fromDb: InstructorOption[] = (data ?? []).map((row: any) => ({
          id: String(row.id),
          name: String(row.name ?? "Unknown"),
          type: (row.type ?? "expert") as InstructorOption["type"],
          // Map DB availability to content status type
          status: row.availability === "available"
            ? "active"
            : row.availability === "unavailable"
              ? "inactive"
              : (row.availability ?? undefined),
          // DB may not track pod, omit to avoid rendering undefined
          podName: undefined,
        }));

        if (fromDb.length > 0) {
          setInstructorOptions(fromDb.sort((a, b) => a.name.localeCompare(b.name)));
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

          const hasMentorLevel = member.certs?.some((cert) => cert.level === "mentor");
          const dispatchCertified = member.certs?.some(
            (cert) => cert.id.startsWith("dispatch-") && cert.level !== "expired",
          );

          options.push({
            id: member.id,
            name: member.profile.display_name,
            type: hasMentorLevel ? "mentor" : dispatchCertified ? "dispatcher" : "expert",
            podName: pod.name,
            status: member.status,
          });
        }
      }
      if (!cancelled) {
        setInstructorOptions(options.sort((a, b) => a.name.localeCompare(b.name)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pods]);

  const modules = React.useMemo(() => {
    if (!academyClass) return [];
    const blueprint = COURSE_BLUEPRINT.find((pathway) => pathway.id === academyClass.pathwayId);
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
          // eslint-disable-next-line no-console
          console.warn("Failed to persist academy class", error);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Error saving academy class", e);
      }

      router.push("/academy");
    },
    [academyClass, router, updateAcademyClass],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      removeAcademyClass(id);
      // Delete from Supabase
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client.from("academy_classes").delete().eq("id", id);
        if (error) {
          // eslint-disable-next-line no-console
          console.warn("Failed to delete academy class", error);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Error deleting academy class", e);
      }
      router.push("/academy");
    },
    [removeAcademyClass, router],
  );

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
