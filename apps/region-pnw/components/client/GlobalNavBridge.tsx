"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { navConfig } from "@/nav.config";
import { GlobalNav } from "./global-nav";
import type { NavRole } from "@workspace/store/utils/nav";
import { useRegionAdapters } from "@/providers/RegionProvider";
import type { Profile } from "@workspace/store/types/global.ts";

export function GlobalNavBridge({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const { session, status } = useAuth();
  const { profileAdapter } = useRegionAdapters();

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);

  const isAuthenticated = Boolean(session);
  const baseRoleUnsafe = (session?.user?.role as any) ?? "team_member";
  const allowedRoles: NavRole[] = [
    "team_member",
    "pod_leader",
    "trainer",
    "dispatcher_basic",
    "dispatcher_verified",
    "dispatcher_admin",
    "admin",
    "regional_admin",
    "national_admin",
  ];
  const baseRole: NavRole = allowedRoles.includes(baseRoleUnsafe)
    ? (baseRoleUnsafe as NavRole)
    : "team_member"; // sanitize unknown auth roles like "authenticated"

  React.useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const userId = session?.user?.id;
      if (!userId) {
        setProfile(null);
        return;
      }
      setLoadingProfile(true);
      try {
        const p = await profileAdapter.loadProfile(userId);
        if (!cancelled) setProfile(p as Profile | null);
      } catch (e) {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, profileAdapter]);

  // Prefer profile.access_role if it is a NavRole; else use baseRole
  const role: NavRole = React.useMemo(() => {
    const ar = profile?.access_role as any;
    if (ar && allowedRoles.includes(ar)) return ar as NavRole;
    return baseRole;
  }, [allowedRoles, baseRole, profile?.access_role]);

  // wait until auth initialized
  if (status === "loading") return null;

  return (
    <GlobalNav
      config={navConfig}
      isAuthenticated={isAuthenticated}
      role={role}
      rightSlot={rightSlot}
    />
  );
}
