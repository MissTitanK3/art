// tools/apps/region-pnw/app/(authed)/pods/[id]/shifts/page.tsx
"use client";

import * as React from "react";
import { Separator } from "@workspace/ui/components/separator";
import { useParams, useRouter } from "next/navigation";
import { usePodStore } from "@/providers/PodStoreProvider";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import PodShiftsDataLayer from "@/components/dataLayer/pods/PodShiftsDataLayer";

export default function PodShiftsPage() {
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");
  const router = useRouter();

  const pods = usePodStore((state) => state.pods);
  const pod = pods.find((candidate) => candidate.slug === podId);


  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-l font-bold">{pod?.name} Shifts</h1>
      </div>
      <Separator className="my-4" />
      <PodShiftsDataLayer />
    </>
  );
}
