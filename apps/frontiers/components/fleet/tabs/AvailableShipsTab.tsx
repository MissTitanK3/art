"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import type { ShipCatalog } from "@/schemas/ships";

export function AvailableShipsTab(props: {
  catalogLoading: boolean;
  catalog: (ShipCatalog & { eligible?: boolean })[];
  currentShip: any | null;
  selectShip: (shipId: string) => Promise<void>;
}) {
  const { catalogLoading, catalog, currentShip, selectShip } = props;
  return (
    <section id="available-ships">
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        Available Ships
      </h2>
      {catalogLoading ? (
        <div className="text-sm text-muted-foreground">Loading catalog…</div>
      ) : catalog.length === 0 ? (
        <div className="text-sm text-muted-foreground">No ships found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catalog.map((s) => {
            const selected = currentShip?.ship_id === s.id;
            return (
              <div
                key={s.id}
                className={`rounded border p-3 space-y-2 ${selected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Tier {s.tier}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.description}
                </div>
                <div className="text-xs">
                  Unlocks after {s.required_days} day(s)
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={selected ? "secondary" : "default"}
                    disabled={!s.eligible || selected}
                    onClick={() => selectShip(s.id)}
                  >
                    {selected ? "Selected" : s.eligible ? "Select" : "Locked"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
