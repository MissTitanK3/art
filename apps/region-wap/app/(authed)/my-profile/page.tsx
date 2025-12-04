"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { ProfileLayout } from "@workspace/ui/layout/profile/profile-layout";
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
      .filter(
        (v: unknown): v is string => typeof v === "string" && v.length > 0
      );
  }
  return [];
}
// Adapter bridges (Supabase in production via RegionProvider)
async function fetchProfileByUserId(
  userId: string,
  profileAdapter: {
    loadProfile: (userId: string) => Promise<Profile | null>;
  }
): Promise<Profile | null> {
  return profileAdapter.loadProfile(userId);
}
async function saveProfileToDatabase(
  profile: Profile,
  profileAdapter: {
    saveProfile: (profile: Profile) => Promise<void>;
  }
): Promise<void> {
  await profileAdapter.saveProfile(profile);
}
async function deleteProfileFromDatabase(
  idOrUserId: string,
  profileAdapter: {
    deleteProfile: (idOrUserId: string) => Promise<void>;
  }
): Promise<void> {
  await profileAdapter.deleteProfile(idOrUserId);
}
function ProfileDataLayerComponent() {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const { profileAdapter } = useRegionAdapters();
  const { session } = useAuth();
  const [remoteProfile, setRemoteProfile] = useState<Profile | null>(null);
  const [loadingRemoteProfile, setLoadingRemoteProfile] = useState(false);
  const profileId = profile?.id;
  const userId = session?.user?.id ?? profile?.user_id;
  useEffect(() => {
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
              user_id:
                (values as any).user_id ??
                session?.user?.id ??
                activeProfile.user_id,
              display_name:
                (values as any).display_name ??
                activeProfile.display_name ??
                "",
              access_role:
                (values as any).access_role ?? activeProfile.access_role,
              field_roles:
                (values as any).field_roles ?? activeProfile.field_roles ?? [],
              verified_by:
                (values as any).verified_by ?? activeProfile.verified_by,
              affiliation:
                nz((values as any).affiliation) ?? activeProfile.affiliation,
              availability:
                (values as any).availability ??
                activeProfile.availability ??
                false,
              contact_signal:
                nz((values as any).contact_signal) ??
                activeProfile.contact_signal,
              coordination_zone:
                nz((values as any).coordination_zone) ??
                activeProfile.coordination_zone,
              inserted_at: activeProfile.inserted_at,
              coverage_zones: coverage_ids,
              state: (values as any).state ?? activeProfile.state ?? "",
              weekly_availability: nz((values as any).weekly_availability) ??
                activeProfile.weekly_availability ?? { blocks: {} },
              self_risk_acknowledged:
                (values as any).self_risk_acknowledged ??
                activeProfile.self_risk_acknowledged ??
                false,
              city: nz((values as any).city) ?? activeProfile.city,
              operating_counties:
                (values as any).operating_counties ??
                activeProfile.operating_counties ??
                [],
              self_status_flags:
                (values as any).self_status_flags ??
                activeProfile.self_status_flags ??
                [],
            };
            // Persist using region-selected adapter (Supabase in production)
            await saveProfileToDatabase(next, profileAdapter);
            setProfile(next);
            return { ok: true };
          } catch (error: any) {
            return {
              ok: false,
              err: error?.message ?? "Failed to save profile",
            };
          }
        }}
        onDeleteProfile={async (id) => {
          clearProfile();
          setRemoteProfile(null);
          if (id) {
            await deleteProfileFromDatabase(id, profileAdapter);
          }
        }}
      />
    </>
  );
}
function ReasonBanner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const reason = searchParams.get("reason");
  const message = useMemo(() => {
    switch (reason) {
      case "profile-required":
        return {
          title: "Complete your profile",
          text: "We brought you here to complete your profile before proceeding.",
        };
      case "suspended":
        return {
          title: "Account suspended",
          text: "Your access is temporarily suspended. Contact a region admin for help.",
        };
      case "awaiting_verification":
        return {
          title: "Verification needed",
          text: "Your account needs verification before you can access that area.",
        };
      case "forbidden-admin":
        return {
          title: "Admin access required",
          text: "You tried to access an admin-only area. If this is a mistake, contact an admin.",
        };
      case "forbidden-dispatch":
        return {
          title: "Dispatch privileges required",
          text: "You need elevated dispatch privileges to view that page.",
        };
      case "forbidden-schedules":
        return {
          title: "Schedules restricted",
          text: "Only local or dispatch admins can manage coverage schedules.",
        };
      case "forbidden-elevated":
        return {
          title: "Elevated role required",
          text: "That action is restricted to elevated roles (pod leaders, trainers, or admins).",
        };
      default:
        return reason
          ? {
              title: "Access limited",
              text: "You were redirected due to access restrictions.",
            }
          : null;
    }
  }, [reason]);
  useEffect(() => {
    setHidden(false);
  }, [reason]);
  if (!message || hidden) return null;
  return (
    <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{message.title}</div>
          <div className="text-sm opacity-90">{message.text}</div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="rounded-md px-2 py-1 text-sm text-amber-900 hover:bg-amber-100"
          onClick={() => {
            setHidden(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("reason");
            router.replace(
              `${pathname}${params.size ? `?${params.toString()}` : ""}`
            );
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
function ProfilePageContent() {
  const profile = useProfileStore((s) => s.profile);
  const needsVerificationHint = useMemo(() => {
    if (!profile) return false;
    const unverified = !profile.verified_by || profile.verified_by === "self";
    const riskNotAck = !profile.self_risk_acknowledged;
    return unverified || riskNotAck;
  }, [profile]);
  return (
    <div className="max-w-5xl mx-auto p-0 md:p-8">
      {/* Always mount the data layer so it can hydrate from Supabase */}
      <ReasonBanner />
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      <Link
        href="/my-profile/map"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted my-3"
      >
        Select Zones of Operation
      </Link>

      {!profile ? (
        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">No profile found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have a profile yet. After signing in, create your
            profile to continue.
          </p>
        </div>
      ) : (
        <>
          {needsVerificationHint ? (
            <div className="my-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-emerald-900">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm">
                  <div className="font-semibold">Complete verification</div>
                  <div className="opacity-90">
                    Your account may require verification and risk
                    acknowledgement.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {/* Profile is present; editor below reflects current store state */}
        </>
      )}
      <ProfileDataLayerComponent />
    </div>
  );
}
export default function ProfilePage() {
  return <ProfilePageContent />;
}
