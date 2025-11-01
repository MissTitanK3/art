"use client";

import * as React from "react";
import type { ComTeam } from "@workspace/store/types/comms.ts";
import { Button } from "@workspace/ui/components/button";
import { CheckInTimerBadge } from "@workspace/ui/components/dispatch/CheckInTimerBadge";
import { EmptyText } from "@workspace/ui/components/status-text";

type Props = {
  teams: ComTeam[];
  defaultCheckInMinutes: number;
  onCheckIn?: (id: string) => void | Promise<unknown>;
};

export function CommsTeamCheckInList({ teams, defaultCheckInMinutes, onCheckIn }: Props) {
  const [localDefault, setLocalDefault] = React.useState<number>(() => {
    if (typeof window === 'undefined') return defaultCheckInMinutes;
    const stored = window.localStorage.getItem('comms.defaultCheckInMinutes');
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultCheckInMinutes;
  });

  React.useEffect(() => {
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
            <Button key={v} size="sm" variant={localDefault === v ? 'default' : 'outline'} onClick={() => setDefault(v)} aria-label={`Set default check-in to ${v} minutes`}>
              {v}m
            </Button>
          ))}
        </div>
      </div>
      {teams.length === 0 ? (
        <EmptyText>No teams configured.</EmptyText>
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
                  <CheckInTimerBadge lastCheckIn={t.last_check_in ?? undefined} intervalMinutes={interval} mode="due" />
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
