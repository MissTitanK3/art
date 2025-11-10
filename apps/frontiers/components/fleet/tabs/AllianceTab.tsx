"use client";

import * as React from "react";

type Fleet = {
  id: string;
  name: string;
  region_id: string | null;
  leader_id: string | null;
  members: string[] | null;
};

export function AllianceTab(props: {
  fleetsLoading: boolean;
  fleets: Fleet[];
  profileId: string | null;
}) {
  const { fleetsLoading, fleets, profileId } = props;

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        Alliance
      </h2>
      {fleetsLoading ? (
        <div className="text-sm text-muted-foreground">Loading fleets…</div>
      ) : fleets.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No fleets yet. Create or join a fleet to see it here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fleets.map((f) => (
            <div key={f.id} className="rounded border p-3 space-y-1">
              <div className="font-medium text-sm">{f.name}</div>
              <div className="text-xs text-muted-foreground">
                {f.region_id ? `Region: ${f.region_id}` : "No region"}
              </div>
              <div className="text-xs text-muted-foreground">
                Role: {f.leader_id === profileId ? "Leader" : "Member"}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
