"use client";

import { useMemo } from "react";
import { useShipStore } from "@/store/useShipStore";

function Meter({ label, value }: { label: string; value: number }) {
  const color = useMemo(
    () =>
      value <= 33
        ? "bg-green-500"
        : value <= 66
          ? "bg-yellow-500"
          : "bg-red-500",
    [value],
  );
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-20 text-left">
        {label}
      </span>
      <div className="h-2 w-40 rounded bg-muted overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="text-[10px] w-8 text-right">{value}%</span>
    </div>
  );
}

export function FatigueMeters() {
  const fatigue = useShipStore((s) => s.fatigue);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
      <Meter label="Crew Fatigue" value={fatigue} />
    </div>
  );
}
