"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { usePodStore } from "@/providers/PodStoreProvider";
import { CreatePathwayClassContent } from "@workspace/ui/components/academy/CreatePathwayClassContent";
import type { CourseBlueprint } from "@workspace/ui/data/academy/course-blueprint";
import type { AcademyClass } from "@workspace/store/usePodStore";

type CreatePathwayClassDataLayerProps = {
  pathway: CourseBlueprint;
};

export function CreatePathwayClassDataLayer({
  pathway,
}: CreatePathwayClassDataLayerProps) {
  const router = useRouter();
  const addAcademyClass = usePodStore((state) => state.addAcademyClass);

  const handleCreateClass = React.useCallback(
    async (academyClass: AcademyClass) => {
      addAcademyClass(academyClass);
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
