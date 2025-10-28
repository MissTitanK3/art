"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { navConfig } from "@/nav.config";
import { GlobalNav } from "./global-nav";
import type { NavRole } from "@workspace/store/utils/nav";
import { useRegionAdapters } from "@/providers/RegionProvider";
import type { Profile } from "@workspace/store/types/global.ts";

export function GlobalNavBridge({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const { session, status } = useAuth();
  const { profileAdapter } = useRegionAdapters();

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);

  const isAuthenticated = Boolean(session);
  const baseRoleUnsafe = (session?.user?.role as any) ?? "guest";
  const allowedRoles: NavRole[] = [
    "guest",
    "user",
    "volunteer",
    "pod_leader",
    "trainer",
    "admin",
    "regional_admin",
    "national_admin",
  ];
  const baseRole: NavRole = allowedRoles.includes(baseRoleUnsafe)
    ? (baseRoleUnsafe as NavRole)
    : "user"; // sanitize unknown auth roles like "authenticated"

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

  // Map dispatcher profile roles to a UI NavRole so the nav reflects server access
  const role: NavRole = React.useMemo(() => {
    // Prioritize profile access_role when available
    const ar = profile?.access_role;
    if (ar === "dispatcher_admin") return "national_admin"; // shows Admin + Schedules + all elevated
    if (ar === "dispatcher_verified") return "pod_leader"; // elevated features
    if (ar === "dispatcher_basic") return "volunteer"; // verified features
    // Fall back to sanitized auth role
    return baseRole;
  }, [baseRole, profile?.access_role]);

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
