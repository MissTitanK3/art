"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";

export function MarketFilters({
  positionTemplates,
  marketFilter,
  setMarketFilter,
  marketBestFit,
  setMarketBestFit,
  marketOnlyUncovered,
  setMarketOnlyUncovered,
}: {
  positionTemplates: Array<{ position_id: string }>;
  marketFilter: string;
  setMarketFilter: (v: string) => void;
  marketBestFit: boolean;
  setMarketBestFit: (v: boolean) => void;
  marketOnlyUncovered: boolean;
  setMarketOnlyUncovered: (v: boolean) => void;
}) {
  const pids = React.useMemo(
    () => Array.from(new Set(positionTemplates.map((p) => p.position_id))),
    [positionTemplates]
  );
  return (
    <div className="flex flex-col md:flex-row justify-between mb-2">
      <h2 className="text-sm font-medium text-muted-foreground">Crew Market</h2>
      <div className="flex flex-col md:flex-row gap-2">
        {pids.length > 0 ? (
          <>
            <label className="text-xs text-muted-foreground">Position</label>
            <Select
              value={marketFilter || "all"}
              onValueChange={(v) => setMarketFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger size="sm" className="min-w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {pids.map((pid) => (
                  <SelectItem key={pid} value={pid}>
                    {pid.replace(/[-_]/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : null}
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="accent-primary"
            checked={marketBestFit}
            onChange={(e) => setMarketBestFit(e.target.checked)}
          />{" "}
          Best fit
        </label>
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="accent-primary"
            checked={marketOnlyUncovered}
            onChange={(e) => setMarketOnlyUncovered(e.target.checked)}
          />{" "}
          Only uncovered
        </label>
      </div>
    </div>
  );
}
