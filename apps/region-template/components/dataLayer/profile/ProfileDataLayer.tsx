// apps/region-template/components/dataLayer/profile/ProfileDataLayer.tsx
"use client";

import { Profile, useProfileStore } from "@workspace/store/profileStore";
import { ProfileForm, type ProfileFormProps } from "@workspace/ui/components/client/profile/ProfileForm";
import { NextImageAdapter } from "@/adapters/NextImageAdapter";
import { useRegionAdapters } from "@/lib/providers/RegionProvider";
import { toast } from "sonner";
import { WeeklyAvailability } from "@workspace/store/types/profile.ts";

/** Store <-> UI transform helpers */
type UiCoverage = { id: string; label: string; area?: any };

function toUiCoverage(input: string[] | undefined): UiCoverage[] {
  return (input ?? []).map((id) => ({ id, label: id }));
}

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
  const { profileAdapter } = useRegionAdapters();

  if (!profile) return null;

  const initial: ProfileFormProps["initial"] = {
    ...profile,
    coverage_zones: toUiCoverage(profile.coverage_zones),
  };

  return (
    <ProfileForm
      initial={initial}
      ImageComponent={NextImageAdapter}
      ImageUrl="/signal_helper.jpg"
      onSubmit={async (values) => {
        try {
          const coverage_ids = toStoreCoverage(values.coverage_zones);
          const next: Profile = {
            ...profile,
            ...values,
            user_id: values.user_id ?? '',
            coverage_zones: coverage_ids,
            access_role: initial.access_role ?? "team_member",
            verified_by: initial.verified_by ?? "self",
            field_roles: initial.field_roles ?? [],
            affiliation: initial.affiliation ?? "",
            contact_signal: initial.contact_signal ?? "",
            coordination_zone: initial.coordination_zone ?? "",
            city: initial.city ?? "",
            availability: initial.availability ?? false,
            self_risk_acknowledged: initial.self_risk_acknowledged ?? false,
            weekly_availability: initial.weekly_availability ?? { blocks: {} },
          };
          setProfile(next);
          await profileAdapter.saveProfile(next);
          return { ok: true };
        } catch (err: any) {
          toast.error("Failed to save profile");
          return { ok: false, err: err.message };
        }
      }}
      onDelete={async () => {
        clearProfile();
        if (profile?.id) {
          await profileAdapter.deleteProfile(profile.id);
        }
        return { ok: true };
      }}
    />
  );
}
