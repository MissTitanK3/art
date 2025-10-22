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

export function ClassAssignmentDataLayer({ classId }: ClassAssignmentDataLayerProps) {
  const router = useRouter();
  const academyClass = usePodStore(
    React.useCallback(
      (state) => state.academyClasses.find((entry) => entry.id === classId),
      [classId],
    ),
  );
  const pods = usePodStore((state) => state.pods);
  const updateAcademyClass = usePodStore((state) => state.updateAcademyClass);
  const removeAcademyClass = usePodStore((state) => state.removeAcademyClass);

  const instructorOptions = React.useMemo<InstructorOption[]>(() => {
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

    return options.sort((a, b) => a.name.localeCompare(b.name));
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

      router.push("/academy");
    },
    [academyClass, router, updateAcademyClass],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      removeAcademyClass(id);
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
