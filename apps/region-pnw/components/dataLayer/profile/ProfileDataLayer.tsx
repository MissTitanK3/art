// apps/region-pnw/components/dataLayer/profile/ProfileDataLayer.tsx
"use client";

import * as React from "react";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { ProfileLayout } from "@workspace/ui/layout/profile/ProfileLayout";
import { NextImageAdapter } from "@/lib/adapters/NextImageAdapter";
import { useRegionAdapters } from "@/providers/RegionProvider";
import { Profile } from "@workspace/store/types/global.ts";
import { UiCoverage } from "@workspace/store/types/profile";
import { useAuth } from "@/hooks/useAuth";

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

// Adapter bridges (Supabase in production via RegionProvider)
async function fetchProfileByUserId(
  userId: string,
  profileAdapter: { loadProfile: (userId: string) => Promise<Profile | null> }
): Promise<Profile | null> {
  return profileAdapter.loadProfile(userId);
}

async function saveProfileToDatabase(
  profile: Profile,
  profileAdapter: { saveProfile: (profile: Profile) => Promise<void> }
): Promise<void> {
  await profileAdapter.saveProfile(profile);
}

async function deleteProfileFromDatabase(
  idOrUserId: string,
  profileAdapter: { deleteProfile: (idOrUserId: string) => Promise<void> }
): Promise<void> {
  await profileAdapter.deleteProfile(idOrUserId);
}

export function ProfileDataLayer() {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const { profileAdapter } = useRegionAdapters();
  const { session } = useAuth();

  const [remoteProfile, setRemoteProfile] = React.useState<Profile | null>(null);
  const [loadingRemoteProfile, setLoadingRemoteProfile] = React.useState(false);

  const profileId = profile?.id;
  const userId = session?.user?.id ?? profile?.user_id;

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // Prefer loading by authenticated user id when available
      const key = userId ?? profileId;
      if (!key) return;

      setLoadingRemoteProfile(true);
      try {
        const result = await fetchProfileByUserId(key, profileAdapter);
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
  }, [userId, profileId, setProfile, profileAdapter]);

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
            const nz = (v: unknown) => (v === null ? undefined : (v as any));
            const coverage_ids = toStoreCoverage(values.coverage_zones);

            const next: Profile = {
              id: activeProfile.id,
              user_id: (values as any).user_id ?? (session?.user?.id ?? activeProfile.user_id),
              display_name: (values as any).display_name ?? activeProfile.display_name ?? "",
              access_role: (values as any).access_role ?? activeProfile.access_role,
              field_roles: (values as any).field_roles ?? activeProfile.field_roles ?? [],
              verified_by: (values as any).verified_by ?? activeProfile.verified_by,
              affiliation: nz((values as any).affiliation) ?? activeProfile.affiliation,
              availability: (values as any).availability ?? activeProfile.availability ?? false,
              contact_signal: nz((values as any).contact_signal) ?? activeProfile.contact_signal,
              coordination_zone: nz((values as any).coordination_zone) ?? activeProfile.coordination_zone,
              inserted_at: activeProfile.inserted_at,
              coverage_zones: coverage_ids,
              state: (values as any).state ?? activeProfile.state ?? "",
              weekly_availability:
                nz((values as any).weekly_availability) ?? activeProfile.weekly_availability ?? { blocks: {} },
              self_risk_acknowledged:
                (values as any).self_risk_acknowledged ?? activeProfile.self_risk_acknowledged ?? false,
              city: nz((values as any).city) ?? activeProfile.city,
              operating_counties:
                (values as any).operating_counties ?? activeProfile.operating_counties ?? [],
            };

            // Persist using region-selected adapter (Supabase in production)
            await saveProfileToDatabase(next, profileAdapter);
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
              await deleteProfileFromDatabase(id, profileAdapter);
            }
          } catch (error) {
            throw error;
          }
        }}
      />
    </>
  );
}
