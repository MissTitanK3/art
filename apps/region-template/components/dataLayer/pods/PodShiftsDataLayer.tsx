// apps/region-template/components/dataLayer/pods/PodShiftsDataLayer.tsx
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Separator } from "@workspace/ui/components/separator";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

import { usePodsStore } from "@workspace/store/podStore";
import { combineLocalDateTime } from "@workspace/ui/lib/utils";
import { Shift } from "@workspace/store/types/pod.ts";
import { ShiftIntentionSection } from "@workspace/ui/components/client/shifts/ShiftIntentionSection";

export default function PodShiftsDataLayer() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const podSlug = decodeURIComponent(params.id ?? "");

  const { pods, shifts, addShift, updateShift, removeShift } = usePodsStore();
  const pod = pods.find((p) => p.slug === podSlug);

  const podShifts = shifts.filter((s) => s.podId === pod?.id);

  const [form, setForm] = React.useState({
    id: pod?.id,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    headcount: 1,
    location: "",
    label: "",
    dispatchLink: "",
  });

  if (!pod) {
    return (
      <section className="mx-auto w-full max-w-4xl sm:px-4">
        <p className="text-sm text-muted-foreground">Pod not found</p>
      </section>
    );
  }

  function handleAdd() {
    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      toast.error("Incomplete shift details", {
        description: "Set all required fields.",
        duration: 4000,
      });
      return;
    }

    const start = combineLocalDateTime(form.startDate, form.startTime);
    const end = combineLocalDateTime(form.endDate, form.endTime);

    if (!start || !end || end <= start) {
      toast.error("Invalid shift times", {
        description: "End must be after start.",
        duration: 4000,
      });
      return;
    }

    addShift({
      id: crypto.randomUUID(),
      podId: pod?.id!,
      start,
      end,
      tz: form.tz,
      headcount: form.headcount,
      location: form.location.trim(),
      label: form.label,
      dispatchLink: form.dispatchLink,
    });

    setForm({
      id: pod?.id,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      headcount: 1,
      location: "",
      label: "",
      dispatchLink: "",
    });
  }

  return (
    <section className="mx-auto w-full max-w-4xl sm:px-4">
      <p className="mt-1 text-sm text-muted-foreground">
        Configure shifts and availability for this pod.
      </p>

      {/* Add shift form */}
      <ShiftIntentionSection
        title="Add Shift"
        form={form}
        setForm={setForm}
        onAdd={handleAdd}
        addButtonText="Add Shift"
      />

      <Separator className="my-6" />

      {/* Shifts list */}
      <div className="grid gap-2">
        {podShifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shifts added yet.</p>
        ) : (
          podShifts.map((shift: Shift) => (
            <>
              <Card key={shift.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{shift.label || "Untitled shift"}</p>
                    <p className="text-xs text-muted-foreground">
                      {shift.start} → {shift.end} ({shift.tz})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeShift(shift.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </>
          ))
        )}
      </div>
    </section>
  );
}
