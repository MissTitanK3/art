"use client";
import { Button } from "@workspace/ui/primitives/button";
import { humanizeKey, pct } from "@/lib/format";
export function MissingSlotCard({
  slot,
  kind,
  onInstall,
  disabled,
}: {
  slot: string;
  kind: {
    id: string;
    name: string;
    tier?: number;
    base?: Record<string, number>;
  } | null;
  onInstall: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded border p-3 space-y-2 text-sm bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{slot}</span>
        <span className="text-xs text-amber-600 dark:text-amber-400">
          Missing
        </span>
      </div>
      {kind ? (
        <div className="text-xs text-muted-foreground flex items-center justify-between gap-2">
          <span className="truncate" title={kind.name}>
            {kind.name}
          </span>
          {kind?.tier ? (
            <span className="text-[10px] rounded bg-muted px-1 py-0.5">
              Tier {kind.tier}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          No default kind available
        </div>
      )}
      {kind?.base && Object.keys(kind.base).length ? (
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground">Base</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(kind.base).map(([kk, vv]) => (
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
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button size="sm" onClick={onInstall} disabled={disabled || !kind}>
          Install
        </Button>
      </div>
    </div>
  );
}
