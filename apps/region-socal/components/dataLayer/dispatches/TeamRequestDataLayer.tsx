"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TeamRequestForm from "@workspace/ui/components/client/team-request/TeamRequestForm";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { TEAM_CONFIG_PRESETS } from "@workspace/store/types/roles.ts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

async function createSubmissionInDatabase(
  submission: DispatchSubmission,
): Promise<void> {
  try {
    // Use server API to insert and trigger notifications
    const resp = await fetch("/api/dispatches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(t || "Failed to create dispatch submission");
    }
  } catch (e: any) {
    throw new Error(e?.message ?? "Failed to create dispatch submission");
  }
}

function TeamRequestContent() {
  const addSubmission = useDispatchStore((s) => s.addSubmission);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cameFromWatch = (searchParams?.get("source") ?? "") === "watch-map";
  const labelFromWatch = searchParams?.get("label") ?? undefined;
  const agencyFromWatch = searchParams?.get("agency") ?? undefined;

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

    // Optional: allow explicit eventType preset from QS
    const qsEventType = (searchParams.get("eventType") ?? undefined) as
      | keyof typeof TEAM_CONFIG_PRESETS
      | undefined;
    const presetKey: keyof typeof TEAM_CONFIG_PRESETS =
      qsEventType && TEAM_CONFIG_PRESETS[qsEventType]
        ? qsEventType
        : "scout_check";
    const preset = TEAM_CONFIG_PRESETS[presetKey];

    return {
      basicInfo: {
        location,
        location_label: locationLabel,
      },
      eventType: presetKey as keyof typeof TEAM_CONFIG_PRESETS,
      actions: {
        intended_action_preset: presetKey,
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
        Submit a request for support.
      </p>
      {cameFromWatch ? (
        <div className="mb-4">
          <Alert>
            <AlertTitle>Prefilled from Watch</AlertTitle>
            <AlertDescription>
              This request was started from a Watch report
              {labelFromWatch ? (
                <>
                  {" "}
                  at <span className="font-medium">{labelFromWatch}</span>
                </>
              ) : null}
              {agencyFromWatch ? (
                <>
                  . Reported agency:{" "}
                  <span className="font-medium">{agencyFromWatch}</span>
                </>
              ) : null}
              . Review location and notes before submitting.
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div className="grid gap-3">
        <TeamRequestForm
          onCreateSubmission={async (draft) => {
            try {
              await createSubmissionInDatabase(draft);
            } catch (error) {
              // Non-blocking: log but still update local store for UX continuity
              console.warn(
                "TeamRequestDataLayer: failed to persist submission",
                error,
              );
            }
            addSubmission(draft);
          }}
          onSubmitted={(submission) =>
            router.push(`/dispatches/submission/${submission.id}`)
          }
          initialData={initialFormData}
        />
      </div>
    </section>
  );
}

export default function TeamRequestDataLayer() {
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
