"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import type { ShipComponent } from "@/schemas/ship_components";
import { humanizeKey, pct } from "@/lib/format";

export function ComponentCard({
  c,
  kinds,
  onUpgrade,
  onReplace,
}: {
  c: ShipComponent;
  kinds: Array<{
    id: string;
    name: string;
    tier?: number;
    base?: Record<string, number>;
    perLevel?: Record<string, number>;
  }>;
  onUpgrade: () => void;
  onReplace: () => void;
}) {
  const resolvedKind = React.useMemo(
    () => kinds.find((k) => k.id === (c as any).kind) || kinds[0],
    [kinds, c]
  );
  const base = (resolvedKind?.base || {}) as Record<string, number>;
  const per = (resolvedKind?.perLevel || {}) as Record<string, number>;
  const level = Math.max(1, Number(c.level || 1));
  const currentStats = React.useMemo(() => {
    const out: Record<string, number> = { ...base };
    if (level > 1)
      for (const [kk, vv] of Object.entries(per))
        out[kk] = (out[kk] || 0) + (vv || 0) * (level - 1);
    return Object.entries(out);
  }, [base, per, level]);
  const integrityPct = React.useMemo(
    () => Math.round(Math.max(0, Math.min(1, c.integrity)) * 100),
    [c.integrity]
  );
  return (
    <div className="rounded border p-3 space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{c.slot}</span>
        <span className="text-xs text-muted-foreground">Lvl {c.level}</span>
      </div>
      <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
        <span
          className="truncate"
          title={resolvedKind?.name || (c as any).kind}
        >
          {resolvedKind?.name || (c as any).kind}
        </span>
        {resolvedKind?.tier ? (
          <span className="text-[10px] rounded bg-muted px-1 py-0.5">
            Tier {resolvedKind.tier}
          </span>
        ) : null}
      </div>
      {Object.keys(base).length ||
      Object.keys(per).length ||
      currentStats.length ? (
        <div className="space-y-2">
          {Object.keys(base).length ? (
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">Base</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(base).map(([kk, vv]) => (
                  <span
                    key={kk}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                  >
                    {humanizeKey(kk)} {pct(Number(vv))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {Object.keys(per).length ? (
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">Per level</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(per).map(([kk, vv]) => (
                  <span
                    key={kk}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                  >
                    {humanizeKey(kk)} {pct(Number(vv))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {currentStats.length ? (
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">Current</div>
              <div className="flex flex-wrap gap-1">
                {currentStats.map(([kk, vv]) => (
                  <span
                    key={kk}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                  >
                    {humanizeKey(kk)} {pct(Number(vv))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Integrity</span>
        <div className="h-2 w-24 rounded bg-muted overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${integrityPct}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {integrityPct}%
        </span>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={onUpgrade}>
          Upgrade
        </Button>
        <Button size="sm" onClick={onReplace}>
          Replace
        </Button>
      </div>
    </div>
  );
}
