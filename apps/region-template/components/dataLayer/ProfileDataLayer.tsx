// apps/region-template/components/ProfileDataLayer.tsx
"use client";

import * as React from "react";
import {
  ProfileForm,
  type ProfileFormOutput,
  type ProfileFormProps,
} from "@workspace/ui/components/client/profile/ProfileForm";

import { useProfileStore } from "@workspace/store/profileStore";
import { Button } from "@workspace/ui/components/button";

/** UI expects objects; store keeps string ids */
type UiCoverage = { id: string; label: string; area?: any };

function toUiCoverage(input: string[] | undefined): UiCoverage[] {
  return (input ?? []).map((id) => ({ id, label: id }));
}

/** Store invariant: string[] */
function toStoreCoverage(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((z: any) => (typeof z === "string" ? z : z?.id))
      .filter((v: unknown): v is string => typeof v === "string" && v.length > 0);
  }
  return [];
}

export function ProfileDataLayer() {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const restoreDemo = useProfileStore((s) => s.restoreDemo);

  if (!profile) {
    return (
      <div className="mt-6 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">No profile found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For demo purposes, you can restore the seeded example profile.
        </p>
        <div className="mt-4">
          <Button type="button" onClick={restoreDemo}>
            Restore demo profile
          </Button>
        </div>
      </div>
    );
  }

  // Shape the store profile to what the form wants
  const initial: ProfileFormProps["initial"] = {
    ...profile,
    coverage_zones: toUiCoverage(profile.coverage_zones),
  };

  return (
    <ProfileForm
      initial={initial}
      onSubmit={async (values: ProfileFormOutput) => {
        // Normalize the form’s coverage_zones back to the store invariant
        const coverage_ids = toStoreCoverage(values.coverage_zones);
        setProfile({
          ...profile,
          ...values,
          coverage_zones: coverage_ids,
        });
        return { ok: true };
      }}
      onDelete={async () => {
        clearProfile();
        return { ok: true };
      }}
    />
  );
}
