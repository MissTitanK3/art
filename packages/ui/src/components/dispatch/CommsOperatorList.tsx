"use client";

import * as React from "react";
import type { ComOperator } from "@workspace/store/types/comms.ts";
import { Button } from "@workspace/ui/components/button";
import { CheckInTimerBadge } from "@workspace/ui/components/dispatch/CheckInTimerBadge";
import { EmptyText } from "@workspace/ui/components/status-text";

type Props = {
  operators: ComOperator[];
  defaultCheckInMinutes: number;
  onCheckIn?: (id: string) => void | Promise<unknown>;
};

export function CommsOperatorList({ operators, defaultCheckInMinutes, onCheckIn }: Props) {
  return (
    <div className="space-y-2 text-sm">
      {operators.length === 0 ? (
        <EmptyText>No operators online.</EmptyText>
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
                  <CheckInTimerBadge lastCheckIn={op.last_check_in ?? undefined} intervalMinutes={interval} mode="percent" />
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

export default CommsOperatorList;
