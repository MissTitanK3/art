"use client";

import * as React from "react";

type Args = {
  lastCheckIn: string | null | undefined;
  intervalMinutes: number; // configured
};

export function useCheckInTimer({ lastCheckIn, intervalMinutes }: Args) {
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000); // update every 15s
    return () => clearInterval(id);
  }, []);

  const last = lastCheckIn ? new Date(lastCheckIn).getTime() : 0;
  const intervalMs = Math.max(1, intervalMinutes) * 60_000;
  const elapsed = last ? now - last : intervalMs * 2; // if never checked, mark overdue
  const percent = Math.min(1, Math.max(0, elapsed / intervalMs));

  // color logic: green (0-80%), yellow (80-100%), red (>100%)
  const status: "green" | "yellow" | "red" =
    elapsed <= intervalMs * 0.8
      ? "green"
      : elapsed <= intervalMs
        ? "yellow"
        : "red";
  const overdueMinutes = (elapsed - intervalMs) / 60000;

  return { status, percent, overdueMinutes } as const;
}
