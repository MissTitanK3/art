"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useRegionAdapters } from "@/providers/RegionProvider";
import type { Profile } from "@workspace/store/types/global.ts";

function defaultDisplayName(email: string, fallback?: string) {
  if (fallback && fallback.trim().length > 0) return fallback;
  const local = email.split("@")[0] ?? email;
  return local;
}

const PENDING_PROFILE_KEY = "pending-profile";

export function AutoCreateProfile() {
  const { session, status, providerId } = useAuth();
  const { profileAdapter } = useRegionAdapters();
  const createdForUserId = React.useRef<string | null>(null);
  const pathname = usePathname();
  // Skip auto-create on admin routes to avoid extra client reads
  const isAdminRoute = (pathname ?? '').startsWith('/admin');

  React.useEffect(() => {
    let cancelled = false;

    async function ensureProfile() {
      if (cancelled) return;
      if (isAdminRoute) return;
      if (providerId !== "supabase") return;
      if (status !== "authenticated" || !session?.user?.id) return;
      const userId = session.user.id;
      if (createdForUserId.current === userId) return;

      try {
        const existing = await profileAdapter.loadProfile(userId);
        if (existing) {
          // Hydrate missing display_name for legacy/null rows
          const needsName = typeof (existing as any).display_name !== 'string' || (existing as any).display_name.trim().length === 0;
          if (needsName) {
            try {
              const next = {
                ...(existing as any),
                display_name: defaultDisplayName(session.user.email, session.user.fullName),
              } as Profile;
              await profileAdapter.saveProfile(next);
            } catch {
              // ignore; non-blocking
            }
          }
          createdForUserId.current = userId;
          return;
        }

        // Use any pending profile captured during sign-up
        let pending: Partial<Profile> | null = null;
        try {
          const raw = localStorage.getItem(PENDING_PROFILE_KEY);
          if (raw) {
            const map = JSON.parse(raw) as Record<string, Partial<Profile>>;
            pending = map?.[session.user.email] ?? null;
          }
        } catch {
          // ignore
        }

        const now = new Date().toISOString();
        const base: Profile = {
          id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${userId}-${Date.now()}`,
          user_id: userId,
          display_name: defaultDisplayName(session.user.email, session.user.fullName),
          access_role: "team_member",
          field_roles: [],
          verified_by: "self",
          affiliation: "",
          availability: true,
          contact_signal: "",
          coordination_zone: "",
          inserted_at: now,
          coverage_zones: [],
          state: "",
          weekly_availability: { blocks: {} },
          self_risk_acknowledged: false,
          city: "",
          operating_counties: [],
        };

        const profile: Profile = { ...base, ...(pending ?? {}) };

        await profileAdapter.saveProfile(profile);
        createdForUserId.current = userId;

        // Clear used pending profile
        try {
          const raw = localStorage.getItem(PENDING_PROFILE_KEY);
          if (raw) {
            const map = JSON.parse(raw) as Record<string, Partial<Profile>>;
            delete map[session.user.email];
            localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(map));
          }
        } catch {
          // ignore
        }
      } catch (error) {
        // Don't block UI; just log in dev
        if (process.env.NODE_ENV !== "production") {
          console.warn("[AutoCreateProfile] failed to create profile", error);
        }
      }
    }

    ensureProfile();
    return () => {
      cancelled = true;
    };
  }, [providerId, status, session, profileAdapter, isAdminRoute]);

  return null;
}
