"use client";

import * as React from "react";
import type { ComTeam } from "@workspace/store/types/comms.ts";
import { useCheckInTimer } from "./useCheckInTimer";
import { Button } from "@workspace/ui/components/button";

type Props = {
  teams: ComTeam[];
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

export function CommsTeamCheckInList({ teams, defaultCheckInMinutes, onCheckIn }: Props) {
  return (
    <div className="space-y-2 text-sm">
      {teams.length === 0 ? (
        <p className="text-muted-foreground">No teams configured.</p>
      ) : (
        teams.map((t) => {
          const interval = t.default_check_in_interval_minutes ?? defaultCheckInMinutes;
          return (
            <div key={t.id} className="rounded-md border p-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.channel ? `Ch: ${t.channel}` : '—'}
                    {t.location_label ? ` · Loc: ${t.location_label}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TimerBadge lastCheckIn={t.last_check_in ?? undefined} intervalMinutes={interval} />
                  <Button size="sm" variant="outline" onClick={() => onCheckIn?.(t.id)} aria-label={`Check in team ${t.name}`}>
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

export default CommsTeamCheckInList;
