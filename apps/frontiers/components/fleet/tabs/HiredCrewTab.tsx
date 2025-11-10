"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { humanizeKey, pct } from "@/lib/format";
import type { CrewCatalog } from "@/schemas/crew";
type HiredItem = {
  profile_id: string;
  crew_id: string;
  hired_at: string;
  status: "active" | "inactive";
  crew: CrewCatalog;
};

export function HiredCrewTab(props: {
  profileId: string | null;
  hiredLoading: boolean;
  hiredCrew: HiredItem[];
  fireCrew: (crewId: string) => Promise<void>;
  hireCrew: (crewId: string) => Promise<void>;
}) {
  const { profileId, hiredLoading, hiredCrew, fireCrew, hireCrew } = props;

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        Hired Crew
      </h2>
      {!profileId ? (
        <div className="text-sm text-muted-foreground">
          Sign in to view your hired crew.
        </div>
      ) : hiredLoading ? (
        <div className="text-sm text-muted-foreground">Loading hired crew…</div>
      ) : hiredCrew.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          You haven't hired any crew yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hiredCrew.map((h) => (
            <div
              key={`${h.profile_id}-${h.crew_id}`}
              className="rounded border p-3 space-y-2 text-sm max-w-[300px]"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{h.crew?.name || h.crew_id}</div>
                <span className="text-xs text-muted-foreground">
                  {h.crew?.role || "Crew"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Tier {h.crew?.tier ?? "—"}
              </div>
              {typeof h.crew?.cost === "number" ? (
                <div className="text-xs text-muted-foreground">
                  Cost: {h.crew.cost}
                </div>
              ) : null}
              {h.crew?.description ? (
                <div className="text-xs text-muted-foreground">
                  {h.crew.description}
                </div>
              ) : null}
              {h.crew?.bonuses && Object.keys(h.crew.bonuses).length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">
                    Bonuses
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(h.crew.bonuses).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                      >
                        {humanizeKey(k)}{" "}
                        {typeof v === "number" ? pct(v) : String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {h.crew?.feats &&
              Object.entries(h.crew.feats).some(([, val]) => !!val) ? (
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">Feats</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(h.crew.feats)
                      .filter(([, val]) => !!val)
                      .map(([k]) => (
                        <span
                          key={k}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                        >
                          {humanizeKey(k)}
                        </span>
                      ))}
                  </div>
                </div>
              ) : null}
              {h.crew?.disadvantages &&
              Object.entries(h.crew.disadvantages).some(([, val]) => !!val) ? (
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground">
                    Disadvantages
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(h.crew.disadvantages)
                      .filter(([, val]) => !!val)
                      .map(([k]) => (
                        <span
                          key={k}
                          className="rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 text-[10px]"
                        >
                          {humanizeKey(k)}
                        </span>
                      ))}
                  </div>
                </div>
              ) : null}
              <div className="flex justify-end">
                {h.status === "active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fireCrew(h.crew_id)}
                  >
                    Fire
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => hireCrew(h.crew_id)}>
                    Rehire
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
