"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { usePodStore } from "@/providers/PodStoreProvider";
import { CreatePathwayClassContent } from "@workspace/ui/components/academy/CreatePathwayClassContent";
import type { CourseBlueprint } from "@workspace/ui/data/academy/course-blueprint";
import type { AcademyClass } from "@workspace/store/usePodStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CreatePathwayClassDataLayerProps = {
  pathway: CourseBlueprint;
};

export function CreatePathwayClassDataLayer({ pathway }: CreatePathwayClassDataLayerProps) {
  const router = useRouter();
  const addAcademyClass = usePodStore((state) => state.addAcademyClass);

  const handleCreateClass = React.useCallback(
    async (academyClass: AcademyClass) => {
      // Optimistically add to local store
      addAcademyClass(academyClass);

      // Persist to Supabase
      try {
        const client = getSupabaseBrowserClient();
        const row = {
          id: academyClass.id,
          pathway_id: academyClass.pathwayId,
          pathway_label: academyClass.pathwayLabel,
          track_label: academyClass.trackLabel,
          variant: academyClass.variant,
          title: academyClass.title,
          description: academyClass.description,
          modality: academyClass.modality,
          instructor_type: academyClass.instructorType,
          duration_hours: academyClass.durationHours,
          capacity: academyClass.capacity,
          start_date: academyClass.startDate,
          start_time: academyClass.startTime,
          location: academyClass.location,
          meeting_url: academyClass.meetingUrl,
          notes: academyClass.notes,
          instructor_name: academyClass.instructorName,
          sessions_scheduled: academyClass.sessionsScheduled,
          next_session: academyClass.nextSession,
          status: academyClass.status,
        } as const;
        const { error } = await client.from("academy_classes").upsert(row);
        if (error) {
          // eslint-disable-next-line no-console
          console.warn("Failed to create academy class in Supabase", error);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Error creating academy class in Supabase", e);
      }

      router.push(`/academy/class/${academyClass.id}`);
    },
    [addAcademyClass, router],
  );

  return (
    <CreatePathwayClassContent
      pathway={pathway}
      onCreateClass={handleCreateClass}
      onBackToAcademy={() => router.push("/academy")}
      onCancel={() => router.back()}
    />
  );
}
