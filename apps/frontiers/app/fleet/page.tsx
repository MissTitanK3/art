"use client";

import { useProfileStore } from "@/store/useProfileStore";
import { useAuth } from "@/hooks/useAuth";
import { FleetContainer } from "./FleetContainer";

type Fleet = {
  id: string;
  name: string;
  region_id: string | null;
  leader_id: string | null;
  members: string[] | null;
};

export default function FleetPage() {
  const storeProfileId = useProfileStore((s) => s.profile?.id ?? null);
  const { session } = useAuth();
  const profileId = storeProfileId || session?.user?.id || null;

  // Render container with resolved profileId

  return <FleetContainer profileId={profileId} />;
}
