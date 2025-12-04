"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import type { ShipComponent } from "@/schemas/ship_components";
import { humanizeKey, pct } from "@/lib/format";
import { ComponentCard } from "@/components/fleet/ComponentCard";
import { MissingSlotCard } from "@/components/fleet/MissingSlotCard";
import { ConfirmUpgradeDialog } from "@/components/fleet/ConfirmUpgradeDialog";
import { ConfirmReplaceDialog } from "@/components/fleet/ConfirmReplaceDialog";

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

export function ComponentsTab(props: {
  profileId: string | null;
  componentsLoading: boolean;
  components: ShipComponent[];
  currentShip: any | null;
  installComponents: () => Promise<void>;
  missingSlots: Array<ShipComponent["slot"]>;
  catalogKinds: Record<ShipComponent["slot"], Kind[]>;
  getDefaultKindForSlot: (slot: ShipComponent["slot"]) => string | null;
  installComponentForSlot: (slot: ShipComponent["slot"]) => Promise<void>;
  replaceOpen: { slot: ShipComponent["slot"] | null } | null;
  setReplaceOpen: (r: { slot: ShipComponent["slot"] | null } | null) => void;
  prepareUpgradeConfirm: (c: ShipComponent) => void;
  prepareReplaceConfirm: (c: ShipComponent, newKindId: string) => void;
  confirmUpgrade: { slot: ShipComponent["slot"]; cost: number } | null;
  setConfirmUpgrade: (
    v: { slot: ShipComponent["slot"]; cost: number } | null
  ) => void;
  confirmReplace: {
    slot: ShipComponent["slot"];
    kindId: string;
    cost: number;
    deltas: Array<[string, number, number]>;
  } | null;
  setConfirmReplace: (
    v: {
      slot: ShipComponent["slot"];
      kindId: string;
      cost: number;
      deltas: Array<[string, number, number]>;
    } | null
  ) => void;
  doUpgrade: (slot: ShipComponent["slot"]) => Promise<void>;
  doReplace: (slot: ShipComponent["slot"], kindId: string) => Promise<void>;
}) {
  const {
    profileId,
    componentsLoading,
    components,
    currentShip,
    installComponents,
    missingSlots,
    catalogKinds,
    getDefaultKindForSlot,
    installComponentForSlot,
    replaceOpen,
    setReplaceOpen,
    prepareUpgradeConfirm,
    prepareReplaceConfirm,
    confirmUpgrade,
    setConfirmUpgrade,
    confirmReplace,
    setConfirmReplace,
    doUpgrade,
    doReplace,
  } = props;

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        Ship Components
      </h2>
      {!profileId ? (
        <div className="text-sm text-muted-foreground">
          Sign in to view components.
        </div>
      ) : componentsLoading ? (
        <div className="text-sm text-muted-foreground">Loading components…</div>
      ) : components.length === 0 ? (
        <div className="rounded border p-3 text-sm flex items-center justify-between gap-3">
          <span className="text-muted-foreground">
            No components installed yet.
          </span>
          <Button size="sm" onClick={installComponents} disabled={!currentShip}>
            Install Components
          </Button>
        </div>
      ) : (
        <>
          {missingSlots.length > 0 ? (
            <div className="rounded border p-2 text-[11px] text-muted-foreground">
              Missing {missingSlots.length} component
              {missingSlots.length > 1 ? "s" : ""}. Install per slot below or
              use Install Components to add all.
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {missingSlots.map((slot) => {
              const defaultKind = getDefaultKindForSlot(slot);
              const kinds = catalogKinds[slot] || [];
              const k = kinds.find((x) => x.id === defaultKind) || null;
              return (
                <MissingSlotCard
                  key={`missing-${slot}`}
                  slot={slot}
                  kind={k as any}
                  onInstall={() => installComponentForSlot(slot)}
                  disabled={!defaultKind}
                />
              );
            })}
            {components.map((c) => {
              const kinds = catalogKinds[c.slot] || [];
              return (
                <ComponentCard
                  key={c.id}
                  c={c}
                  kinds={kinds as any}
                  onUpgrade={() => prepareUpgradeConfirm(c)}
                  onReplace={() => setReplaceOpen({ slot: c.slot })}
                />
              );
            })}
          </div>
          <Dialog
            open={!!replaceOpen}
            onOpenChange={(o) => setReplaceOpen(o ? replaceOpen : null)}
          >
            <DialogContent className="sm:max-w-md bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle>Replace Component</DialogTitle>
              </DialogHeader>
              {replaceOpen?.slot ? (
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-muted-foreground">
                    Select a new kind for slot:{" "}
                    <span className="font-medium">{replaceOpen.slot}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-auto">
                    {(catalogKinds[replaceOpen.slot] || []).map((k) => (
                      <button
                        key={k.id}
                        className="rounded border p-2 text-left hover:bg-muted"
                        onClick={() => {
                          const cur = components.find(
                            (x) => x.slot === replaceOpen.slot
                          );
                          if (!cur) return;
                          prepareReplaceConfirm(cur, k.id);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{k.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {k.id}
                          </span>
                        </div>
                        {k.description ? (
                          <div className="text-xs text-muted-foreground">
                            {k.description}
                          </div>
                        ) : null}
                        {k.base && Object.keys(k.base).length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(k.base).map(([kk, vv]) => (
                              <span
                                key={kk}
                                className="rounded bg-muted px-1 py-0.5 text-[10px]"
                              >
                                {humanizeKey(kk)} {pct(Number(vv))}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
          <ConfirmUpgradeDialog
            open={!!confirmUpgrade}
            onOpenChange={(o) => setConfirmUpgrade(o ? confirmUpgrade : null)}
            cost={confirmUpgrade?.cost ?? 0}
            onConfirm={async () => {
              if (confirmUpgrade) {
                await doUpgrade(confirmUpgrade.slot);
                setConfirmUpgrade(null);
              }
            }}
          />
          <ConfirmReplaceDialog
            open={!!confirmReplace}
            onOpenChange={(o) => setConfirmReplace(o ? confirmReplace : null)}
            cost={confirmReplace?.cost ?? 0}
            deltas={confirmReplace?.deltas ?? []}
            onConfirm={async () => {
              if (confirmReplace) {
                await doReplace(confirmReplace.slot, confirmReplace.kindId);
              }
            }}
          />
        </>
      )}
    </section>
  );
}
