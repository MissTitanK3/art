"use client";

import * as React from "react";

export function useDerivedBonuses(profileId: string | null, deps: any[] = []) {
  const [derivedBonuses, setDerivedBonuses] = React.useState<Record<
    string,
    number
  > | null>(null);
  const [derivedBreakdown, setDerivedBreakdown] = React.useState<{
    items: Array<{
      type: "crew" | "position";
      id: string;
      name?: string;
      contributions: Record<string, number>;
    }>;
    auras: string[];
    sets?: string[];
  } | null>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!profileId) {
        setDerivedBonuses(null);
        return;
      }
      try {
        const u = new URL(window.location.href);
        u.pathname = "/api/ship/state";
        u.searchParams.set("profile_id", profileId);
        const res = await fetch(u.toString(), { cache: "no-store" });
        const json = await res.json();
        if (res.ok) {
          setDerivedBonuses(json.bonuses || null);
          setDerivedBreakdown(json.breakdown || null);
        }
      } catch {
        setDerivedBonuses(null);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, ...deps]);

  return { derivedBonuses, derivedBreakdown };
}
