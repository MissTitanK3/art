"use client";

import TeamRequestForm from "@workspace/ui/components/client/team-request/TeamRequestForm";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { TEAM_CONFIG_PRESETS } from "@workspace/store/types/roles.ts";

function TeamRequestContent() {
  const addSubmission = useDispatchStore((s) => s.addSubmission);
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFormData = useMemo(() => {
    if (!searchParams) return undefined;

    const parseNumber = (value: string | null) => {
      if (value === null) return undefined;
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    };

    const lat = parseNumber(searchParams.get("lat"));
    const lng = parseNumber(searchParams.get("lng"));
    const label = searchParams.get("label") ?? undefined;
    const agency = searchParams.get("agency") ?? undefined;

    if (lat === undefined && lng === undefined && !label) {
      return undefined;
    }

    const location =
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

    const locationLabel =
      label ??
      (location
        ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
        : undefined);

    if (!location && !locationLabel) {
      return undefined;
    }

    const preset = TEAM_CONFIG_PRESETS.scout_check;

    return {
      basicInfo: {
        location,
        location_label: locationLabel,
      },
      eventType: "scout_check" as const,
      actions: {
        intended_action_preset: "scout_check",
        intended_actions: preset.actions,
        intended_action_notes: agency
          ? `Reported agency presence: ${agency}`
          : undefined,
      },
      rolesNeeded: {
        required_roles: Object.keys(preset.roles),
        required_roles_by_type: preset.roles,
      },
    };
  }, [searchParams]);

  return (
    <section className="max-w-7xl">
      <h1 className="text-2xl font-bold">Team Request</h1>
      <p className="text-muted-foreground mb-4">
        Submit a request for support (dummy-only).
      </p>
      <div className="grid gap-3">
        <TeamRequestForm
          onCreateSubmission={addSubmission}
          onSubmitted={(submission) =>
            router.push(`/dispatches/submission/${submission.id}`)
          }
          initialData={initialFormData}
        />
      </div>
    </section>
  );
}

export default function TeamRequestPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 text-sm text-muted-foreground">
          Loading team request…
        </p>
      }
    >
      <TeamRequestContent />
    </Suspense>
  );
}
