"use client";

import { useMemo } from "react";
import { Badge } from "@workspace/ui/primitives/badge";
import { useFactionStore, rankFor } from "@/store/useFactionStore";
import { useProfileStore } from "@/store/useProfileStore";

export function FactionBadge() {
  const regionId =
    useProfileStore((s) => s.region_id) ||
    process.env.NEXT_PUBLIC_REGION_ID ||
    "demo-region";
  const rep = useFactionStore((s) => s.getReputation(regionId));
  const rank = useMemo(() => rankFor(rep), [rep]);
  const variant =
    rank === "Ally"
      ? "success"
      : rank === "Agent"
        ? "info"
        : rank === "Associate"
          ? "secondary"
          : "outline";
  return (
    <Badge variant={variant as any} className="text-xs">
      {rank} · {rep}
    </Badge>
  );
}
