// tools/apps/region-template/app/(authed)/pods/[id]/shifts/page.tsx
"use client";

import * as React from "react";
import { Separator } from "@workspace/ui/components/separator";
import { useParams, useRouter } from "next/navigation";
import PodShiftsList from "@workspace/ui/components/client/shifts/PodShiftsList";
import { ShiftIntentionSection } from "@workspace/ui/components/client/shifts/ShiftIntentionSection";
import { toast } from "sonner";
import { combineLocalDateTime } from "@workspace/ui/lib/utils";
import { usePodsStore } from "@workspace/store/podStore";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import PodShiftsDataLayer from "@/components/dataLayer/pods/PodShiftsDataLayer";

export default function PodShiftsPage() {
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");
  const router = useRouter();

  const { pods } = usePodsStore(); // ⬅️ from pods store
  const pod = pods.find((p) => p.slug === podId);


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
