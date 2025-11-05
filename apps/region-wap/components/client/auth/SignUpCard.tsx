"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRegionAdapters } from "@/providers/RegionProvider";
import type { Profile } from "@workspace/store/types/global.ts";
import { FIELD_ROLE_OPTIONS } from "@workspace/store/types/roles.ts";
import UiSignUpCard, { type SignUpValues } from "@workspace/ui/components/auth/SignUpCard";

const PENDING_PROFILE_KEY = "pending-profile";

type Props = { redirectTo?: string };

export function SignUpCard({ redirectTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { providerId, signUpWithPassword, refresh, setSession } = useAuth();
  const { profileAdapter } = useRegionAdapters();
  const target = React.useMemo(() => redirectTo ?? searchParams?.get("redirectTo") ?? "/", [redirectTo, searchParams]);

  const onSubmit = React.useCallback(async (values: SignUpValues) => {
    if (providerId !== "supabase") throw new Error("Sign-up is only available with Supabase");
    const { email, password, displayName, affiliation, city, state, contactSignal, coordinationZone, fieldRoles } = values;
    const session = await signUpWithPassword({ email, password });
    const now = new Date().toISOString();
    const baseProfile: Partial<Profile> = {
      display_name: displayName || email.split("@")[0],
      affiliation: affiliation || "",
      city: city || "",
      state: state || "",
      contact_signal: contactSignal,
      coordination_zone: coordinationZone,
      field_roles: fieldRoles as any,
      coverage_zones: [],
      weekly_availability: { blocks: {} },
      access_role: "team_member",
      verified_by: "self",
      inserted_at: now,
    } as Partial<Profile>;

    if (session) {
      try { setSession(session); await refresh(); } catch {}
      const profile: Profile = {
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${session.user.id}-${Date.now()}`,
        user_id: session.user.id,
        coverage_zones: [],
        operating_counties: [],
        ...baseProfile,
        access_role: (baseProfile.access_role as any) || "team_member",
        verified_by: (baseProfile.verified_by as any) || "self",
        availability: baseProfile.availability ?? true,
        self_risk_acknowledged: baseProfile.self_risk_acknowledged ?? false,
        weekly_availability: baseProfile.weekly_availability ?? { blocks: {} },
        inserted_at: baseProfile.inserted_at || now,
      } as Profile;
      try {
        await profileAdapter.saveProfile(profile);
        // Best-effort: notify dispatcher_admin+ that onboarding outreach may be needed
        try {
          await fetch('/api/onboarding/notify-admins', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            // no body needed; server resolves current user + profile
          });
        } catch { /* ignore notification errors so signup succeeds */ }
      }
      catch {
        try {
          const raw = localStorage.getItem(PENDING_PROFILE_KEY);
          const map = raw ? (JSON.parse(raw) as Record<string, Partial<Profile>>) : {};
          map[email] = { ...baseProfile };
          localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(map));
        } catch {}
      }
      router.push(target);
      return;
    } else {
      try {
        const raw = localStorage.getItem(PENDING_PROFILE_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, Partial<Profile>>) : {};
        map[email] = baseProfile;
        localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(map));
      } catch {}
      return { info: "Check your email to confirm your account. We will finish creating your profile after you sign in." };
    }
  }, [providerId, signUpWithPassword, setSession, refresh, profileAdapter, router, target]);

  return <UiSignUpCard onSubmit={onSubmit} roleOptions={[...FIELD_ROLE_OPTIONS]} />;
}

export default SignUpCard;
