"use client";

import { useEffect } from "react";
import { useMissionsStore } from "@/store/useMissionsStore";
import { useProfileStore } from "@/store/useProfileStore";

async function syncNow() {
  const profileId = useProfileStore.getState().profile?.id || null;
  const rows = useMissionsStore.getState().snapshotForSync(profileId);
  if (!profileId || rows.length === 0) return;
  try {
    const res = await fetch("/api/campaigns/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    if (res.ok) useMissionsStore.getState().markSynced();
  } catch {
    // ignore network errors
  }
}

export function MissionsSyncAgent() {
  useEffect(() => {
    const id = setInterval(
      () => {
        void syncNow();
      },
      10 * 60 * 1000,
    );
    const before = () => {
      void syncNow();
    };
    window.addEventListener("beforeunload", before);
    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", before);
    };
  }, []);
  return null;
}
