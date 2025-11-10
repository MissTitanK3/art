"use client";

import * as React from "react";
import { MarketFilters } from "@/components/fleet/MarketFilters";
import { RoleRow } from "@/components/fleet/RoleRow";
import type { CrewCatalog } from "@/schemas/crew";

export function CrewMarketTab(props: {
  positionTemplates: any[];
  marketFilter: string;
  setMarketFilter: (v: string) => void;
  marketBestFit: boolean;
  setMarketBestFit: (b: boolean) => void;
  marketOnlyUncovered: boolean;
  setMarketOnlyUncovered: (b: boolean) => void;
  marketLoading: boolean;
  marketCrew: CrewCatalog[];
  orderedRoles: string[];
  groupedMarket: Map<string, CrewCatalog[]>;
  hiredCrew: Array<{ crew_id: string; status: "active" | "inactive" }>;
  hireCrew: (id: string) => Promise<void>;
  profileId: string | null;
  uncoveredNeeds: Set<string>;
  autoStrategy: "balanced" | "max-repair" | "max-signal" | "max-morale";
}) {
  const {
    positionTemplates,
    marketFilter,
    setMarketFilter,
    marketBestFit,
    setMarketBestFit,
    marketOnlyUncovered,
    setMarketOnlyUncovered,
    marketLoading,
    marketCrew,
    orderedRoles,
    groupedMarket,
    hiredCrew,
    hireCrew,
    profileId,
    uncoveredNeeds,
    autoStrategy,
  } = props;

  return (
    <section>
      <MarketFilters
        positionTemplates={positionTemplates}
        marketFilter={marketFilter}
        setMarketFilter={setMarketFilter}
        marketBestFit={marketBestFit}
        setMarketBestFit={setMarketBestFit}
        marketOnlyUncovered={marketOnlyUncovered}
        setMarketOnlyUncovered={setMarketOnlyUncovered}
      />
      {marketLoading ? (
        <div className="text-sm text-muted-foreground">Loading market…</div>
      ) : marketCrew.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No crew available right now.
        </div>
      ) : (
        <div className="space-y-6">
          {orderedRoles.map((role) => (
            <RoleRow
              key={role}
              role={role}
              items={groupedMarket.get(role) ?? []}
              isActive={(id) =>
                hiredCrew.some((h) => h.crew_id === id && h.status === "active")
              }
              onHire={(id) => hireCrew(id)}
              canHire={!!profileId}
              uncoveredNeeds={uncoveredNeeds}
              autoStrategy={autoStrategy}
            />
          ))}
        </div>
      )}
    </section>
  );
}
