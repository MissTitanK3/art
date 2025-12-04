"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import type { PositionTemplate, Assignment } from "@/schemas/positions";
import type { CrewCatalog } from "@/schemas/crew";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";

type HiredItem = {
  profile_id: string;
  crew_id: string;
  hired_at: string;
  status: "active" | "inactive";
  crew: CrewCatalog;
};

export function StaffingTab(props: {
  currentShip: any | null;
  positionTemplates: PositionTemplate[];
  assignments: Assignment[];
  hiredCrew: HiredItem[];
  autoStrategy: "balanced" | "max-repair" | "max-signal" | "max-morale";
  setAutoStrategy: (
    s: "balanced" | "max-repair" | "max-signal" | "max-morale"
  ) => void;
  saveAssignment: (
    position_id: string,
    slot_index: number,
    shift: number,
    crew_id: string | null
  ) => void;
  autoAssign: () => void;
}) {
  const {
    currentShip,
    positionTemplates,
    assignments,
    hiredCrew,
    autoStrategy,
    setAutoStrategy,
    saveAssignment,
    autoAssign,
  } = props;

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        Ship Staffing
      </h2>
      {!currentShip?.ship && !currentShip?.ship_id ? (
        <div className="text-sm text-muted-foreground">
          Select a ship to staff positions.
        </div>
      ) : positionTemplates.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No positions for this ship yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <label className="text-xs text-muted-foreground">Strategy</label>
            <Select
              value={autoStrategy}
              onValueChange={(v) => setAutoStrategy(v as any)}
            >
              <SelectTrigger size="sm" className="min-w-32">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="max-repair">Max repair</SelectItem>
                <SelectItem value="max-signal">Max signal</SelectItem>
                <SelectItem value="max-morale">Max morale</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={autoAssign}>
              Auto-fill
            </Button>
          </div>
          {positionTemplates.map((p) => {
            const slots = Math.max(1, Number(p.slots || 1));
            const shiftCount = Math.max(1, Number(p.shifts || 1));
            const posName = p.positions_catalog?.name || p.position_id;
            return (
              <div key={p.position_id} className="rounded border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{posName}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.required ? "Required" : "Optional"} • {slots} slot
                    {slots > 1 ? "s" : ""}
                    {shiftCount > 1 ? ` • ${shiftCount} shifts` : ""}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: slots }).map((_, sIdx) => (
                    <div key={sIdx} className="rounded border p-2 text-sm">
                      <div className="text-xs text-muted-foreground mb-1">
                        Slot {sIdx + 1}
                      </div>
                      {Array.from({ length: shiftCount }).map((__, shIdx) => {
                        const current = assignments.find(
                          (a) =>
                            a.position_id === p.position_id &&
                            a.slot_index === sIdx &&
                            a.shift === shIdx + 1
                        );
                        const selectedId = current?.crew_id || "";
                        return (
                          <div
                            key={shIdx}
                            className="flex items-center gap-2 mb-2"
                          >
                            <span className="text-[10px] text-muted-foreground">
                              Shift {shIdx + 1}
                            </span>
                            <Select
                              value={selectedId || "none"}
                              onValueChange={(v) =>
                                saveAssignment(
                                  p.position_id,
                                  sIdx,
                                  shIdx + 1,
                                  v === "none" ? null : v
                                )
                              }
                            >
                              <SelectTrigger size="sm" className="flex-1">
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  — Unassigned —
                                </SelectItem>
                                {hiredCrew.map((h) => (
                                  <SelectItem key={h.crew_id} value={h.crew_id}>
                                    {h.crew?.name || h.crew_id}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
