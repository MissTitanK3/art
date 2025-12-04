"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ShipComponent } from "@/schemas/ship_components";
type Kind = {
  id: string;
  name: string;
  description?: string;
  tier?: number;
  base?: Record<string, number>;
  perLevel?: Record<string, number>;
  upgradeCostBase?: number;
  upgradeCostGrowth?: number;
  replaceCost?: number;
};
export function useShipComponents(profileId: string | null) {
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [components, setComponents] = useState<ShipComponent[]>([]);
  const [catalogKinds, setCatalogKinds] = useState<
    Record<ShipComponent["slot"], Kind[]>
  >({} as any);
  // initial load
  useEffect(() => {
    const run = async () => {
      if (!profileId) {
        setComponents([]);
        return;
      }
      setComponentsLoading(true);
      try {
        const u = new URL(window.location.href);
        u.pathname = "/api/ship/components";
        u.searchParams.set("profile_id", profileId);
        const res = await fetch(u.toString(), { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load components");
        setComponents(Array.isArray(json.components) ? json.components : []);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load components");
        setComponents([]);
      } finally {
        setComponentsLoading(false);
      }
    };
    run();
  }, [profileId]);
  // catalog kinds
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/ship/components/catalog", {
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok) setCatalogKinds(json.catalog || {});
      } catch {}
    };
    run();
  }, []);
  const refreshComponents = useCallback(async () => {
    if (!profileId) return;
    try {
      const u = new URL(window.location.href);
      u.pathname = "/api/ship/components";
      u.searchParams.set("profile_id", profileId);
      const res = await fetch(u.toString(), { cache: "no-store" });
      const json = await res.json();
      if (res.ok)
        setComponents(Array.isArray(json.components) ? json.components : []);
    } catch {}
  }, [profileId]);
  const doUpgrade = useCallback(
    async (slot: ShipComponent["slot"]) => {
      if (!profileId) return;
      try {
        const res = await fetch("/api/ship/components/upgrade", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile_id: profileId, slot }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to upgrade");
        toast.success("Component upgraded");
        refreshComponents();
      } catch (e: any) {
        toast.error(e?.message || "Failed to upgrade component");
      }
    },
    [profileId, refreshComponents],
  );
  const doReplace = useCallback(
    async (slot: ShipComponent["slot"], kind: string) => {
      if (!profileId) return;
      try {
        const res = await fetch("/api/ship/components/replace", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile_id: profileId, slot, kind }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to replace");
        toast.success(
          json.created ? "Component installed" : "Component replaced",
        );
        refreshComponents();
      } catch (e: any) {
        toast.error(e?.message || "Failed to replace component");
      }
    },
    [profileId, refreshComponents],
  );
  return {
    componentsLoading,
    components,
    setComponents,
    catalogKinds,
    setCatalogKinds,
    refreshComponents,
    doUpgrade,
    doReplace,
  };
}
