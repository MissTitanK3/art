"use client";

import * as React from "react";
import type { ComOperator } from "@workspace/store/types/comms.ts";
import { useCheckInTimer } from "./useCheckInTimer";
import { Button } from "@workspace/ui/components/button";

type Props = {
  operators: ComOperator[];
  defaultCheckInMinutes: number;
  onCheckIn?: (id: string) => void | Promise<void>;
};

function TimerBadge({ lastCheckIn, intervalMinutes }: { lastCheckIn: string | null | undefined; intervalMinutes: number }) {
  const { status, percent, overdueMinutes } = useCheckInTimer({ lastCheckIn, intervalMinutes });
  const color = status === 'green' ? 'bg-emerald-500/15 text-emerald-800 border-emerald-200'
    : status === 'yellow' ? 'bg-amber-500/15 text-amber-900 border-amber-200'
    : 'bg-red-500/15 text-red-900 border-red-200';
  const label = status === 'red' ? `Overdue ${Math.max(0, Math.round(overdueMinutes))}m`
    : `${Math.round(percent * 100)}%`;
  return <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs ${color}`}>{label}</span>;
}

export function CommsOperatorList({ operators, defaultCheckInMinutes, onCheckIn }: Props) {
  return (
    <div className="space-y-2 text-sm">
      {operators.length === 0 ? (
        <p className="text-muted-foreground">No operators online.</p>
      ) : (
        operators.map((op) => {
          const interval = op.check_in_interval_minutes ?? defaultCheckInMinutes;
          return (
            <div key={op.id} className="rounded-md border p-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="truncate font-medium">{op.callsign}{op.sector ? ` · ${op.sector}` : ''}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {op.station_name ?? op.station_type ?? '—'}{op.frequency ? ` · ${op.frequency}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TimerBadge lastCheckIn={op.last_check_in ?? undefined} intervalMinutes={interval} />
                  <Button size="sm" variant="outline" onClick={() => onCheckIn?.(op.id)} aria-label={`Check in ${op.callsign}`}>
                    Check In
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
