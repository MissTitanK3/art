"use client";

import * as React from "react";

export type CheckInStatus = "green" | "yellow" | "red";

type HookArgs = {
  lastCheckIn: string | null | undefined;
  intervalMinutes: number;
};

export function useCheckInTimer({ lastCheckIn, intervalMinutes }: HookArgs) {
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const last = lastCheckIn ? new Date(lastCheckIn).getTime() : 0;
  const intervalMs = Math.max(1, intervalMinutes) * 60_000;
  const elapsed = last ? now - last : intervalMs * 2; // never checked => overdue
  const percent = Math.min(1, Math.max(0, elapsed / intervalMs));
  const status: CheckInStatus = elapsed <= intervalMs * 0.8 ? "green" : elapsed <= intervalMs ? "yellow" : "red";
  const overdueMinutes = (elapsed - intervalMs) / 60000;

  return { status, percent, overdueMinutes } as const;
}

type BadgeProps = HookArgs & {
  /**
   * percent: shows percent until due or "Overdue Xm"
   * due: shows "Due in Xm" / "Due now" / "Overdue by Xm"
   */
  mode?: "percent" | "due";
};

export function CheckInTimerBadge({ lastCheckIn, intervalMinutes, mode = "percent" }: BadgeProps) {
  const { status, percent, overdueMinutes } = useCheckInTimer({ lastCheckIn, intervalMinutes });
  const color =
    status === "green"
      ? "bg-emerald-500/15 text-emerald-800 border-emerald-200"
      : status === "yellow"
        ? "bg-amber-500/15 text-amber-900 border-amber-200"
        : "bg-red-500/15 text-red-900 border-red-200";

  let label: string;
  if (mode === "due") {
    const remainingMinutes = Math.max(0, Math.ceil(intervalMinutes * (1 - percent)));
    label = status === "red"
      ? `Overdue by ${Math.max(1, Math.ceil(overdueMinutes))}m`
      : remainingMinutes === 0
        ? "Due now"
        : `Due in ${remainingMinutes}m`;
  } else {
    label = status === "red" ? `Overdue ${Math.max(0, Math.round(overdueMinutes))}m` : `${Math.round(percent * 100)}%`;
  }

  const title = lastCheckIn ? `Last check-in: ${new Date(lastCheckIn).toLocaleString()}` : "No previous check-in";

  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs ${color}`} title={title}>
      {label}
    </span>
  );
}

