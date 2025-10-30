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
  // Countdown minutes remaining until next check-in (non-negative)
  const remainingMinutes = Math.max(0, Math.ceil(intervalMinutes * (1 - percent)));
  const label = status === 'red'
    ? `Overdue by ${Math.max(1, Math.ceil(overdueMinutes))}m`
    : remainingMinutes === 0
      ? 'Due now'
      : `Due in ${remainingMinutes}m`;
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs ${color}`}
      title={lastCheckIn ? `Last check-in: ${new Date(lastCheckIn).toLocaleString()}` : 'No previous check-in'}
    >
      {label}
    </span>
  );
}

export function CommsTeamCheckInList({ teams, defaultCheckInMinutes, onCheckIn }: Props) {
  // Persist a local default interval in 10-minute increments
  const [localDefault, setLocalDefault] = React.useState<number>(() => {
    if (typeof window === 'undefined') return defaultCheckInMinutes;
    const stored = window.localStorage.getItem('comms.defaultCheckInMinutes');
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultCheckInMinutes;
  });

  React.useEffect(() => {
    // If the prop changes (e.g., admin updates), sync when no local override exists
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('comms.defaultCheckInMinutes');
    if (!stored) setLocalDefault(defaultCheckInMinutes);
  }, [defaultCheckInMinutes]);

  const setDefault = (mins: number) => {
    setLocalDefault(mins);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('comms.defaultCheckInMinutes', String(mins));
      }
    } catch {}
  };

  const choices = [10, 20, 30, 40, 50, 60];

  return (
    <div className="space-y-2 text-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Default interval:</span>
        <div className="flex flex-wrap gap-1.5">
          {choices.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={localDefault === v ? 'default' : 'outline'}
              onClick={() => setDefault(v)}
              aria-label={`Set default check-in to ${v} minutes`}
            >
              {v}m
            </Button>
          ))}
        </div>
      </div>
      {teams.length === 0 ? (
        <p className="text-muted-foreground">No teams configured.</p>
      ) : (
        teams.map((t) => {
          const interval = t.default_check_in_interval_minutes ?? localDefault;
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
