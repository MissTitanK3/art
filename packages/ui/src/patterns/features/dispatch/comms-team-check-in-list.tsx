"use client";

import * as React from "react";
import type { ComTeam } from "@workspace/store/types/comms.ts";
import { Button } from "@workspace/ui/primitives/button";
import { CheckInTimerBadge } from "@workspace/ui/patterns/features/dispatch/check-in-timer-badge";
import { EmptyText } from "@workspace/ui/patterns/common/status-text";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";

const NOOP_STORAGE: Storage = {
  get length() {
    return 0;
  },
  clear() {
    /* noop */
  },
  getItem(_key: string) {
    return null;
  },
  key(_index: number) {
    return null;
  },
  removeItem(_key: string) {
    /* noop */
  },
  setItem(_key: string, _value: string) {
    /* noop */
  },
};

const coerceMinutes = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0
      ? Math.round(parsed)
      : undefined;
  }
  return undefined;
};

type Props = {
  teams: ComTeam[];
  defaultCheckInMinutes: number;
  onCheckIn?: (id: string) => void | Promise<unknown>;
  // Optional controls to sync with parent input
  checkInInput?: string;
  setCheckInInput?: (s: string) => void;
  setGlobalCheckInMinutes?: (n: number) => void;
};

export function CommsTeamCheckInList({
  teams,
  defaultCheckInMinutes,
  onCheckIn,
  checkInInput,
  setCheckInInput,
  setGlobalCheckInMinutes,
}: Props): React.ReactElement {
  const isControlled =
    typeof setGlobalCheckInMinutes === "function" &&
    typeof setCheckInInput === "function";

  const storageKey = isControlled
    ? "comms.defaultCheckInMinutes:controlled"
    : "comms.defaultCheckInMinutes";

  const fallbackDefault = React.useMemo(
    () => coerceMinutes(defaultCheckInMinutes) ?? 60,
    [defaultCheckInMinutes]
  );

  const [storedDefault, setStoredDefault] = useLocalStorage<number>(
    storageKey,
    fallbackDefault,
    {
      debounceMs: 150,
      sync: !isControlled,
      serialize: (value) => String(value),
      deserialize: (raw) => coerceMinutes(raw) ?? fallbackDefault,
      migrate: (payload) => coerceMinutes(payload) ?? fallbackDefault,
      storage: isControlled ? NOOP_STORAGE : undefined,
    }
  );

  React.useEffect(() => {
    if (isControlled) return;
    const nextDefault = coerceMinutes(defaultCheckInMinutes);
    if (!nextDefault) return;
    setStoredDefault((prev) => (coerceMinutes(prev) ? prev : nextDefault));
  }, [defaultCheckInMinutes, isControlled, setStoredDefault]);

  const setDefault = (mins: number) => {
    const next = coerceMinutes(mins);
    if (!next) return;
    setStoredDefault(next);
  };

  const choices = [10, 20, 30, 40, 50, 60];
  const selectedFromParent = coerceMinutes(checkInInput ?? undefined);

  return (
    <div className="space-y-2 text-sm">
      <div className="mb-2 flex justify-center w-full">
        <div>
          {setCheckInInput && setGlobalCheckInMinutes ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {[10, 20, 30, 40, 50, 60].map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={
                    parseInt(checkInInput || "0", 10) === v
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setCheckInInput(String(v));
                    setGlobalCheckInMinutes(v);
                  }}
                  aria-label={`Set default check-in to ${v} minutes`}
                >
                  {v}m
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {choices.map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={
                    (selectedFromParent ?? storedDefault) === v
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setDefault(v)}
                  aria-label={`Set default check-in to ${v} minutes`}
                >
                  {v}m
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      {teams.length === 0 ? (
        <EmptyText>No teams configured.</EmptyText>
      ) : (
        teams.map((t) => {
          const interval =
            t.default_check_in_interval_minutes ??
            selectedFromParent ??
            storedDefault;
          return (
            <div key={t.id} className="rounded-md border p-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.channel ? `Ch: ${t.channel}` : "—"}
                    {t.location_label ? ` · Loc: ${t.location_label}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckInTimerBadge
                    lastCheckIn={t.last_check_in ?? undefined}
                    intervalMinutes={interval}
                    mode="due"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCheckIn?.(t.id)}
                    aria-label={`Check in team ${t.name}`}
                  >
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
