"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CrewCatalog } from "@/schemas/crew";
export type HiredItem = {
  profile_id: string;
  crew_id: string;
  hired_at: string;
  status: "active" | "inactive";
  crew: CrewCatalog;
};
export function useHiredCrew(profileId: string | null) {
  const [hiredCrew, setHiredCrew] = useState<HiredItem[]>([]);
  const [hiredLoading, setHiredLoading] = useState(false);
  const loadHiredCrew = useCallback(async () => {
    if (!profileId) {
      setHiredCrew([]);
      return;
    }
    setHiredLoading(true);
    try {
      const u = new URL(window.location.href);
      u.pathname = "/api/crew/hired";
      u.searchParams.set("profile_id", profileId);
      const res = await fetch(u.toString(), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load hired crew");
      setHiredCrew(Array.isArray(json.crew) ? json.crew : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load hired crew");
      setHiredCrew([]);
    } finally {
      setHiredLoading(false);
    }
  }, [profileId]);
  useEffect(() => {
    loadHiredCrew();
  }, [loadHiredCrew]);
  const hireCrew = useCallback(
    async (crewId: string) => {
      if (!profileId) {
        toast("Sign in to hire crew");
        return;
      }
      try {
        const res = await fetch("/api/crew/hire", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile_id: profileId, crew_id: crewId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to hire crew");
        toast.success("Crew hired");
        loadHiredCrew();
      } catch (e: any) {
        toast.error(e?.message || "Failed to hire crew");
      }
    },
    [profileId, loadHiredCrew],
  );
  const fireCrew = useCallback(
    async (crewId: string) => {
      if (!profileId) {
        toast("Sign in to manage crew");
        return;
      }
      try {
        const res = await fetch("/api/crew/fire", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile_id: profileId, crew_id: crewId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update crew");
        toast.success("Crew updated");
        loadHiredCrew();
      } catch (e: any) {
        toast.error(e?.message || "Failed to update crew");
      }
    },
    [profileId, loadHiredCrew],
  );
  return {
    hiredCrew,
    hiredLoading,
    hireCrew,
    fireCrew,
    reloadHiredCrew: loadHiredCrew,
  };
}
