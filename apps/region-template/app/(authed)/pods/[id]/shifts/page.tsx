// tools/apps/region-template/app/(authed)/pods/[id]/shifts/page.tsx
"use client";

import * as React from "react";
import { Separator } from "@workspace/ui/components/separator";
import { useShiftStore } from "@/lib/shiftStore";
import { useParams } from "next/navigation";
import PodShiftsList from "@workspace/ui/components/client/shifts/PodShiftsList";
import { ShiftIntentionSection } from "@workspace/ui/components/client/shifts/ShiftIntentionSection";
import { toast } from "sonner";
import { combineLocalDateTime } from "@workspace/ui/lib/utils";

export default function PodShiftsPage() {
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");

  const { shifts, addShift, removeShift, updateShift } = useShiftStore();
  const podShifts = shifts.filter((s) => s.podId === podId);

  const [form, setForm] = React.useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone, // keep a TZ string
    headcount: 1,
    location: "",
    label: '',
    dispatchLink: ''
  });

  function handleAdd() {
    if (!form.startTime || !form.endTime || !form.startDate || !form.endDate) {
      toast.error("Incomplete shift details", {
        description: "Set all required fields.",
        duration: 4000,
      });
      return;
    };
    const start = combineLocalDateTime(form.startDate, form.startTime);
    const end = combineLocalDateTime(form.endDate, form.endTime);

    // Simple guard: end after start
    if (!start || !end || end <= start) {
      toast.error("Invalid shift times", {
        description: "Set both start and end, and ensure end is after start.",
        duration: 4000,
      });
      return;
    }

    // Save to your store
    addShift({
      id: crypto.randomUUID(),
      podId,
      start,
      end,
      tz: form.tz,
      headcount: form.headcount,
      location: form.location.trim(),
      label: form.label,
      dispatchLink: form.dispatchLink
    });
    setForm({
      label: "",
      startDate: '',
      startTime: "",
      endDate: '',
      endTime: "",
      location: "",
      headcount: 1,
      dispatchLink: "", tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  return (
    <>
      <h2 className="font-semibold">Shifts</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Configure pod shifts and availability.
      </p>
      <ShiftIntentionSection
        title="Add Shift"
        form={form}
        setForm={setForm}
        onAdd={handleAdd}
        addButtonText="Add Shift"
      />
      <Separator className="my-4" />
      <PodShiftsList
        podShifts={podShifts}
        removeShift={removeShift}
        updateShift={updateShift}

      />
    </>
  );
}
