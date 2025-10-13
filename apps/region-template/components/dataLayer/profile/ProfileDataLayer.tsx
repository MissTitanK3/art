// apps/region-template/components/dataLayer/profile/ProfileDataLayer.tsx
"use client";

import * as React from "react";
import { Profile, useProfileStore } from "@workspace/store/profileStore";
import { ProfileLayout } from "@workspace/ui/layout/profile/ProfileLayout";
import { NextImageAdapter } from "@/adapters/NextImageAdapter";
import { useRegionAdapters } from "@/lib/providers/RegionProvider";

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

async function fetchProfileFromDatabase(profileId: string): Promise<Profile | null> {
  // TODO: replace with real database integration.
  // Example:
  // const { data } = await client.from("profiles").select("*").eq("id", profileId).single();
  // return data ? mapRowToProfile(data) : null;
  await Promise.resolve();
  return null;
}

async function saveProfileToDatabase(profile: Profile): Promise<void> {
  // TODO: replace with real persistence call (insert/update).
  // Example:
  // await client.from("profiles").upsert(transformProfile(profile));
  await Promise.resolve();
}

async function deleteProfileFromDatabase(profileId: string): Promise<void> {
  // TODO: replace with actual delete/archive operation.
  // Example:
  // await client.from("profiles").delete().eq("id", profileId);
  await Promise.resolve();
}

export function ProfileDataLayer() {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const { profileAdapter } = useRegionAdapters();

  const [remoteProfile, setRemoteProfile] = React.useState<Profile | null>(null);
  const [loadingRemoteProfile, setLoadingRemoteProfile] = React.useState(false);

  const profileId = profile?.id;

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!profileId) return;

      setLoadingRemoteProfile(true);
      try {
        const result = await fetchProfileFromDatabase(profileId);
        if (!cancelled && result) {
          setRemoteProfile(result);
          setProfile(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("ProfileDataLayer: failed to fetch profile", error);
        }
      } finally {
        if (!cancelled) {
          setLoadingRemoteProfile(false);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [profileId, setProfile]);

  const activeProfile = remoteProfile ?? profile;

  if (!activeProfile) return null;

  const initial = {
    ...activeProfile,
    coverage_zones: toUiCoverage(activeProfile.coverage_zones),
  };

  return (
    <>
      {loadingRemoteProfile ? (
        <p className="px-4 text-sm text-muted-foreground">
          Loading profile from database...
        </p>
      ) : null}

      <ProfileLayout
        profile={activeProfile}
        initial={initial}
        ImageComponent={NextImageAdapter}
        imageUrl="/signal_helper.jpg"
        onSubmit={async (values) => {
          try {
            const coverage_ids = toStoreCoverage(values.coverage_zones);
            const next: Profile = {
              ...activeProfile,
              ...values,
              user_id: values.user_id ?? "",
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
            await saveProfileToDatabase(next);
            await profileAdapter.saveProfile(next);
            setProfile(next);
            return { ok: true };
          } catch (error: any) {
            return { ok: false, err: error?.message ?? "Failed to save profile" };
          }
        }}
        onDeleteProfile={async (id) => {
          try {
            clearProfile();
            setRemoteProfile(null);
            if (id) {
              await deleteProfileFromDatabase(id);
              await profileAdapter.deleteProfile(id);
            }
          } catch (error) {
            throw error;
          }
        }}
      />
    </>
  );
}
