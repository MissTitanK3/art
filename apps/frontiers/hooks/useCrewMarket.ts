"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CrewCatalog } from "@/schemas/crew";
export function useCrewMarket(filters: { position?: string | null }) {
  const { position } = filters;
  const [marketCrew, setMarketCrew] = useState<CrewCatalog[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const loadMarket = useCallback(async () => {
    setMarketLoading(true);
    try {
      const u = new URL(window.location.href);
      u.pathname = "/api/crew/market";
      if (position) u.searchParams.set("position", position);
      const res = await fetch(u.toString(), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load crew market");
      setMarketCrew(Array.isArray(json.crew) ? json.crew : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load crew market");
      setMarketCrew([]);
    } finally {
      setMarketLoading(false);
    }
  }, [position]);
  useEffect(() => {
    loadMarket();
  }, [loadMarket]);
  return { marketCrew, marketLoading, reloadMarket: loadMarket };
}
