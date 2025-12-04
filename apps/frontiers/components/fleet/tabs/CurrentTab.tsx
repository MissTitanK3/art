"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { StaffingEffectsPanel } from "@/components/fleet/StaffingEffectsPanel";
import { StatBar } from "@/components/fleet/StatBar";
import { humanizeKey, pct } from "@/lib/format";
import { ShipCustomization } from "@/components/fleet/ShipCustomization";
import { RepairInterface } from "@/components/fleet/RepairInterface";
import { ResupplyInterface } from "@/components/fleet/ResupplyInterface";
export function CurrentTab(props: {
  profileId: string | null;
  shipLoading: boolean;
  ship: {
    ship_condition: number;
    morale: number;
    fatigue: number;
  } | null;
  currentShip: any | null;
  derivedBonuses: Record<string, number> | null;
  derivedBreakdown: {
    items: Array<{
      type: "crew" | "position";
      id: string;
      name?: string;
      contributions: Record<string, number>;
    }>;
    auras: string[];
    sets?: string[];
  } | null;
  componentBonuses?: Record<string, number>;
  componentBreakdown?: Array<{
    slot: string;
    name: string;
    tier?: number;
    level: number;
    contributions: Record<string, number>;
  }>;
  effectsOpen: boolean;
  setEffectsOpen: (b: boolean) => void;
  onDockRepair: () => Promise<void>;
  resetting: boolean;
  setActiveTab: (t: string) => void;
  abandonOpen: boolean;
  setAbandonOpen: (b: boolean) => void;
  abandonShip: () => Promise<void>;
}) {
  const {
    profileId,
    shipLoading,
    ship,
    currentShip,
    derivedBonuses,
    derivedBreakdown,
    componentBonuses,
    componentBreakdown,
    effectsOpen,
    setEffectsOpen,
    onDockRepair,
    resetting,
    setActiveTab,
    abandonOpen,
    setAbandonOpen,
    abandonShip,
  } = props;
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const keyExplanation = useCallback((key: string): string => {
    const k = key.toLowerCase();
    if (
      k.includes("signal_yield") ||
      (k.includes("yield") && k.includes("signal"))
    )
      return "Signal Yield: Increases rewards and findings from successful scans and signals.";
    if (
      k.includes("signal_clarity") ||
      (k.includes("clarity") && k.includes("signal"))
    )
      return "Signal Clarity: Improves scan quality, unlocking higher-tier outcomes and reducing noise.";
    if (k.includes("repair"))
      return "Repair Bonus: Speeds up dock repairs and improves integrity recovery.";
    if (k.includes("integrity") && k.includes("upkeep"))
      return "Integrity Upkeep: Slows down ship wear over time, keeping condition higher.";
    if (k.includes("route") && k.includes("efficiency"))
      return "Route Efficiency: Lowers travel costs and time for missions.";
    if (k.includes("fatigue"))
      return "Fatigue Reduction: Crew accumulates fatigue slower during missions.";
    if (k.includes("morale") && k.includes("recovery"))
      return "Morale Recovery: Crew morale bounces back faster after activities.";
    return `${humanizeKey(key)}: Contributes to overall ship performance.`;
  }, []);
  const keyImpacts = useCallback((key: string): string[] => {
    const k = key.toLowerCase();
    const impacts: string[] = [];
    if (k.includes("signal")) impacts.push("Signals/Scans");
    if (
      k.includes("repair") ||
      (k.includes("integrity") && k.includes("upkeep"))
    )
      impacts.push("Ship Integrity");
    if (k.includes("route") && k.includes("efficiency"))
      impacts.push("Travel/Missions");
    if (k.includes("fatigue")) impacts.push("Crew Fatigue");
    if (k.includes("morale")) impacts.push("Crew Morale");
    if (impacts.length === 0) impacts.push("General Performance");
    return impacts;
  }, []);
  function ImpactChip({ k, v }: { k: string; v: number }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (!open) return;
      const onDocClick = (e: MouseEvent) => {
        if (!ref.current) return;
        const t = e.target as Node | null;
        if (ref.current.contains(t)) return;
        setOpen(false);
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);
    const explain = keyExplanation(k);
    const impacts = keyImpacts(k);
    return (
      <div
        className="relative rounded bg-muted px-1.5 py-0.5 flex items-center justify-between gap-2"
        ref={ref}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-foreground shrink-0">
            {pct(Number(v))}
          </span>
          <span className="text-[10px] truncate" title={humanizeKey(k)}>
            {humanizeKey(k)}
          </span>
        </div>
        <button
          type="button"
          aria-label={`${humanizeKey(k)} details`}
          className="h-4 w-4 shrink-0 rounded-full border flex items-center justify-center text-[10px] text-muted-foreground hover:bg-background/60"
          onClick={() => setOpen((o) => !o)}
          title="What does this affect?"
        >
          i
        </button>
        {open ? (
          <div className="absolute z-10 top-full right-0 mt-1 w-64 rounded border bg-card text-card-foreground p-2 shadow">
            <div className="text-[10px] space-y-1">
              <div className="font-medium text-foreground">
                {humanizeKey(k)}
              </div>
              <div>{explain}</div>
              <div className="pt-1">
                <div className="text-muted-foreground">Primarily impacts</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {impacts.map((it, i) => (
                    <span key={i} className="rounded bg-muted px-1 py-0.5">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Current Ship
        </h2>
        {currentShip?.ship && (
          <Dialog open={customizationOpen} onOpenChange={setCustomizationOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Ship Customization</DialogTitle>
              </DialogHeader>
              <ShipCustomization />
            </DialogContent>
          </Dialog>
        )}
      </div>
      {!profileId ? (
        <div className="text-sm text-muted-foreground">
          Sign in to view your ship.
        </div>
      ) : shipLoading ? (
        <div className="text-sm text-muted-foreground">Loading ship…</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="text-muted-foreground">Selected</div>
                {currentShip?.ship ? (
                  <div className="font-medium space-y-1">
                    <div>{currentShip.ship.name}</div>
                    <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                      <span className="rounded bg-muted px-1 py-0.5">
                        {currentShip.ship.role} · {currentShip.ship.mass_class}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5">
                        Crew {currentShip.ship.crew_requirements}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5">
                        Upkeep {currentShip.ship.upkeep_cost}/day
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5">
                        Fuel eff.{" "}
                        {pct(Number(currentShip.ship.fuel_efficiency))}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5">
                        Power cap {currentShip.ship.power_capacity}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5">
                        Morale {pct(Number(currentShip.ship.morale_influence))}
                      </span>
                      <span className="rounded bg-muted px-1 py-0.5">
                        Depreciation{" "}
                        {pct(Number(currentShip.ship.depreciation_rate))}
                      </span>
                      {currentShip.ship.sector_bonus
                        ? Object.entries(
                            currentShip.ship.sector_bonus as Record<
                              string,
                              number
                            >,
                          ).map(([region, bonus]) => (
                            <span
                              key={region}
                              className="rounded bg-muted px-1 py-0.5"
                            >
                              {humanizeKey(region)} {pct(Number(bonus))}
                            </span>
                          ))
                        : null}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      No ship selected
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveTab("available")}
                    >
                      Select a ship
                    </Button>
                  </div>
                )}
              </div>
              {currentShip?.ship ? (
                <div className="text-xs text-muted-foreground">
                  Tier {currentShip.ship.tier}
                </div>
              ) : null}
            </div>
            {ship ? (
              <>
                <StatBar
                  value={ship.ship_condition}
                  label="Ship"
                  effects={
                    derivedBonuses
                      ? (
                          [
                            [
                              "repair_bonus",
                              Number(derivedBonuses["repair_bonus"] || 0),
                            ],
                            [
                              "integrity_upkeep",
                              Number(derivedBonuses["integrity_upkeep"] || 0),
                            ],
                          ] as Array<[string, number]>
                        ).filter(([, v]) => v !== 0)
                      : undefined
                  }
                  extraTooltipLines={[
                    ...(derivedBreakdown
                      ? [
                          ...(derivedBreakdown.auras || []),
                          ...(derivedBreakdown.sets || []),
                        ]
                      : []),
                    "Lowers: Damage taken during missions and events",
                    "Lowers: Natural wear over time (reduced by Integrity Upkeep)",
                    "Lowers: Low component integrity (repair or replace to restore)",
                  ]}
                />
                <StatBar
                  value={ship.morale}
                  label="Morale"
                  effects={
                    derivedBonuses
                      ? (
                          [
                            [
                              "morale_recovery",
                              Number(derivedBonuses["morale_recovery"] || 0),
                            ],
                          ] as Array<[string, number]>
                        ).filter(([, v]) => v !== 0)
                      : undefined
                  }
                  extraTooltipLines={[
                    ...(derivedBreakdown
                      ? [
                          ...(derivedBreakdown.auras || []),
                          ...(derivedBreakdown.sets || []),
                        ]
                      : []),
                    "Lowers: High fatigue and long shifts",
                    "Lowers: Mission failures or negative outcomes",
                    "Lowers: Hazardous events and crises",
                  ]}
                />
                <StatBar
                  value={ship.fatigue}
                  label="Fatigue"
                  effects={
                    derivedBonuses
                      ? (
                          [
                            [
                              "fatigue_reduction",
                              Number(derivedBonuses["fatigue_reduction"] || 0),
                            ],
                          ] as Array<[string, number]>
                        ).filter(([, v]) => v !== 0)
                      : undefined
                  }
                  extraTooltipLines={
                    derivedBreakdown
                      ? [
                          ...(derivedBreakdown.auras || []),
                          ...(derivedBreakdown.sets || []),
                        ]
                      : undefined
                  }
                />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No ship record yet. Use Dock / Repair to initialize.
              </div>
            )}
            {derivedBonuses ? (
              <StaffingEffectsPanel
                derivedBonuses={derivedBonuses}
                derivedBreakdown={derivedBreakdown}
                open={effectsOpen}
                onOpenChange={setEffectsOpen}
              />
            ) : null}
            {componentBonuses && Object.keys(componentBonuses).length ? (
              <div className="border rounded p-2 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="font-medium text-foreground text-[11px]">
                      Component Impact
                    </div>
                    <button
                      type="button"
                      className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted"
                      aria-label="Open components breakdown"
                      onClick={() => setComponentsOpen(true)}
                    >
                      ?
                    </button>
                  </div>
                  {currentShip?.ship?.tier ? (
                    <div className="text-[10px] rounded bg-muted px-1 py-0.5">
                      Ship Tier {currentShip.ship.tier}
                    </div>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {Object.entries(componentBonuses)
                    .filter(([, v]) => (v ?? 0) !== 0)
                    .map(([k, v]) => (
                      <ImpactChip key={k} k={k} v={Number(v)} />
                    ))}
                </div>
                <div className="text-[10px]">
                  Tip: Component bonuses stack with staffing effects. For
                  example, a Tier 3 Comms with strong Signal Yield and Clarity
                  boosts scan payout and quality.
                </div>
                <Dialog open={componentsOpen} onOpenChange={setComponentsOpen}>
                  <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
                    <DialogHeader>
                      <DialogTitle>Components Breakdown</DialogTitle>
                    </DialogHeader>
                    <div className="text-xs space-y-2 max-h-[340px] overflow-auto">
                      <div className="text-[11px] text-muted-foreground">
                        Per-component contributions
                      </div>
                      {(componentBreakdown || []).map((it, i) => (
                        <div key={i} className="rounded border px-2 py-1">
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] font-medium capitalize">
                              {it.slot}: {it.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {it.tier ? `Tier ${it.tier} • ` : ""}Lvl{" "}
                              {it.level}
                            </div>
                          </div>
                          {Object.keys(it.contributions).length ? (
                            <div className="mt-1 grid grid-cols-1 gap-1">
                              {Object.entries(it.contributions).map(
                                ([kk, vv]) => (
                                  <ImpactChip key={kk} k={kk} v={Number(vv)} />
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground">
                              No direct stat bonus
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : null}
            <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground p-1 gap-2 m-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDockRepair}
                  disabled={resetting}
                >
                  {resetting ? "Docking…" : "Dock / Repair"}
                </Button>
                {currentShip ? (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setAbandonOpen(true)}
                    >
                      Abandon Ship
                    </Button>
                    <Dialog open={abandonOpen} onOpenChange={setAbandonOpen}>
                      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
                        <DialogHeader>
                          <DialogTitle>Confirm Abandon Ship</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm space-y-2">
                          <p>Abandoning your ship will:</p>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            <li>Clear your current ship selection</li>
                            <li>Buff crew morale slightly</li>
                            <li>Increase crew trust by a small amount</li>
                            <li>Add a small fatigue cost</li>
                          </ul>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAbandonOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                await abandonShip();
                                setAbandonOpen(false);
                              }}
                            >
                              Confirm
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Maintenance Section */}
          {currentShip?.ship && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RepairInterface />
              <ResupplyInterface />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
