"use client";
import { useAppStore } from "@/lib/store";

export default function SchedulesPage() {
  const shiftsRecord = useAppStore(s => s.shifts);
  const pods = useAppStore(s => s.pods);

  const shifts = Object.values(shiftsRecord);

  return (
    <div suppressHydrationWarning>
      <h1 className="text-lg font-semibold">Shifts</h1>
      <div className="mt-3 grid gap-2">
        {shifts.map(sh => (
          <div key={sh.id} className="border rounded-lg p-3">
            <div className="font-medium">{pods[sh.podId]?.name ?? "Pod"}</div>
            <div className="text-sm">
              {new Date(sh.startsAt).toLocaleString()} →{" "}
              {new Date(sh.endsAt).toLocaleString()} ({sh.tz})
            </div>
            {sh.notes && (
              <div className="text-xs text-muted-foreground mt-1">{sh.notes}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
