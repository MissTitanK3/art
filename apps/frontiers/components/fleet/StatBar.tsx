"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { humanizeKey, pct } from "@/lib/format";
export function StatBar({
  value,
  label,
  effects,
  extraTooltipLines,
}: {
  value: number;
  label: string;
  effects?: Array<[string, number]>;
  extraTooltipLines?: string[];
}) {
  const color = useMemo(
    () =>
      value >= 70
        ? "bg-green-500"
        : value >= 40
          ? "bg-yellow-500"
          : "bg-red-500",
    [value],
  );
  const final = useMemo(() => {
    if (!effects || effects.length === 0)
      return Math.max(0, Math.min(100, value));
    let delta = 0;
    for (const [k, v] of effects) {
      if (typeof v !== "number") continue;
      if (label === "Ship") {
        if (/repair|integrity/i.test(k)) delta += v * 20;
        else delta += v * 10;
      } else if (label === "Morale") {
        if (/morale/i.test(k)) delta += v * 15;
        else delta += v * 8;
      } else if (label === "Fatigue") {
        if (/fatigue/i.test(k)) delta -= v * 15;
        else delta -= v * 5;
      } else {
        delta += v * 10;
      }
    }
    delta = Math.max(-15, Math.min(15, delta));
    return Math.max(0, Math.min(100, value + delta));
  }, [effects, label, value]);
  const tooltip = useMemo(() => {
    const parts: string[] = [];
    parts.push(`Base: ${Math.round(Math.max(0, Math.min(100, value)))}%`);
    if (effects && effects.length > 0) {
      const effStr = effects
        .map(([k, v]) => `${humanizeKey(k)} ${pct(v)}`)
        .join(", ");
      parts.push(`Effects: ${effStr}`);
    }
    parts.push(`Final: ${Math.round(final)}%`);
    for (const line of extraTooltipLines || []) parts.push(line);
    return parts.join(" • ");
  }, [effects, extraTooltipLines, final, value]);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!popRef.current) return;
      if (popRef.current.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);
  const tooltipLines = useMemo(() => tooltip.split(" • "), [tooltip]);
  return (
    <div
      className="flex items-center gap-2 min-w-[140px] relative"
      title={tooltip}
    >
      <span className="text-[10px] text-muted-foreground w-16">{label}</span>
      <div className="h-2 w-32 rounded bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${final}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-8 text-right">
        {Math.round(final)}%
      </span>
      <button
        type="button"
        aria-label={`${label} details`}
        className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted"
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open ? (
        <div
          ref={popRef}
          className="absolute z-10 top-full right-0 mt-1 w-64 rounded border bg-card text-card-foreground p-2 shadow"
        >
          <div className="text-[10px] space-y-1">
            {tooltipLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
