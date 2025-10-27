// apps/region-pnw/components/dataLayer/pods/PodShiftsDataLayer.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { usePodStore } from "@/providers/PodStoreProvider";
import { combineLocalDateTime } from "@workspace/ui/lib/utils";
import { BaseShiftIntentionFields, Shift } from "@workspace/store/types/pod.ts";
import {
  PodShiftsLayout,
  PodShiftsLayoutProps,
} from "@workspace/ui/layout/pods/PodShiftsLayout";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ShiftFormState = BaseShiftIntentionFields & {
  id?: string;
  tz: string;
  dispatchLink: string;
};

function mapRowToShift(row: any): Shift {
  return {
    id: String(row.id),
    podId: String(row.pod_id ?? row.podId),
    start: String(row.start),
    end: String(row.end),
    tz: String(row.tz),
    headcount: Number(row.headcount ?? 1),
    location: String(row.location ?? ""),
    label: row.label ?? undefined,
    dispatchLink: row.dispatch_link ?? row.dispatchLink ?? undefined,
    notes: row.notes ?? undefined,
  };
}

async function fetchPodShiftsFromDatabase(slug: string): Promise<Shift[] | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data: pod, error: podErr } = await client
      .from("pods")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (podErr) throw podErr;
    if (!pod?.id) return null;

    const { data, error } = await client
      .from("pod_shifts")
      .select("*")
      .eq("pod_id", pod.id)
      .order("start", { ascending: true });
    if (error) throw error;
    return (Array.isArray(data) ? data : []).map(mapRowToShift);
  } catch (e) {
    console.warn("[PodShiftsDataLayer] supabase fetch error", e);
    return null;
  }
}

async function persistShiftToDatabase(shift: Shift): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const payload = {
      id: shift.id,
      pod_id: shift.podId,
      start: shift.start,
      end: shift.end,
      tz: shift.tz,
      headcount: shift.headcount,
      location: shift.location,
      label: shift.label,
      dispatch_link: shift.dispatchLink,
      notes: shift.notes,
    };
    const { error } = await client.from("pod_shifts").upsert(payload);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to save shift");
  }
}

async function deleteShiftFromDatabase(shiftId: string): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("pod_shifts").delete().eq("id", shiftId);
    if (error) throw error;
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to delete shift");
  }
}

export default function PodShiftsDataLayer() {
  const params = useParams<{ id: string }>();
  const podSlug = decodeURIComponent(params.id ?? "");

  const pods = usePodStore((state) => state.pods);
  const shifts = usePodStore((state) => state.shifts);
  const addShift = usePodStore((state) => state.addShift);
  const removeShift = usePodStore((state) => state.removeShift);
  const pod = pods.find((p) => p.slug === podSlug);

  const [remoteShifts, setRemoteShifts] = React.useState<Shift[] | null>(null);
  const [loadingRemoteShifts, setLoadingRemoteShifts] =
    React.useState<boolean>(false);
  const [form, setForm] = React.useState<ShiftFormState>({
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

  React.useEffect(() => {
    let cancelled = false;

    async function loadRemoteShifts() {
      if (!podSlug) return;
      setLoadingRemoteShifts(true);
      try {
        const result = await fetchPodShiftsFromDatabase(podSlug);
        if (!cancelled && result) {
          setRemoteShifts(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("PodShiftsDataLayer: failed to fetch shifts", error);
        }
      } finally {
        if (!cancelled) {
          setLoadingRemoteShifts(false);
        }
      }
    }

    loadRemoteShifts();
    return () => {
      cancelled = true;
    };
  }, [podSlug]);

  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      id: pod?.id,
    }));
  }, [pod?.id]);

  if (!pod) {
    return (
      <PodShiftsLayout
        podSlug={podSlug}
        podId={undefined}
        form={form}
        setForm={setForm}
        onAddShift={() => { }}
        shifts={[]}
        onRemoveShift={() => { }}
        notFoundMessage={
          <p className="text-sm text-muted-foreground">Pod not found</p>
        }
      />
    );
  }

  const podShifts = remoteShifts ?? shifts.filter((s) => s.podId === pod.id);

  async function handleAdd() {
    if (!pod) {
      return;
    }
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

    const newShift: Shift = {
      id: crypto.randomUUID(),
      podId: pod.id,
      start,
      end,
      tz: form.tz,
      headcount: form.headcount,
      location: form.location.trim(),
      label: form.label,
      dispatchLink: form.dispatchLink,
    };

    try {
      await persistShiftToDatabase(newShift);
    } catch (error) {
      console.warn("PodShiftsDataLayer: failed to persist shift", error);
    }

    addShift(newShift);
    setRemoteShifts((prev) => (prev ? [...prev, newShift] : prev));

    setForm({
      id: pod.id,
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

  const handleRemove = async (shiftId: string) => {
    if (!pod) {
      return;
    }
    try {
      await deleteShiftFromDatabase(shiftId);
    } catch (error) {
      console.warn("PodShiftsDataLayer: failed to delete shift", error);
    }
    removeShift(shiftId);
    setRemoteShifts((prev) => (prev ? prev.filter((s) => s.id !== shiftId) : prev));
  };

  const layoutProps: PodShiftsLayoutProps<ShiftFormState> = {
    podSlug,
    podId: pod.id,
    form,
    setForm,
    onAddShift: handleAdd,
    shifts: podShifts,
    onRemoveShift: handleRemove,
    addShiftButtonText: "Add Shift",
    loadingMessage: loadingRemoteShifts
      ? "Loading shifts from database..."
      : undefined,
    emptyState: (
      <p className="text-sm text-muted-foreground">
        No shifts added yet. Use the form above to create one.
      </p>
    ),
  };

  return <PodShiftsLayout {...layoutProps} />;
}
