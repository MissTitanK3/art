"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import type { CrewCatalog } from "@/schemas/crew";
import { humanizeKey, pct } from "@/lib/format";

export function CrewCard({
  m,
  active,
  onHire,
  canHire,
  uncoveredNeeds,
  autoStrategy,
}: {
  m: CrewCatalog;
  active: boolean;
  onHire: () => void;
  canHire: boolean;
  uncoveredNeeds?: Set<string>;
  autoStrategy: "balanced" | "max-repair" | "max-signal" | "max-morale";
}) {
  const fits = (m.allowed_positions || []).map(String);
  const [fitOpen, setFitOpen] = React.useState(false);
  const fitRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!fitOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!fitRef.current) return;
      if (fitRef.current.contains(t)) return;
      setFitOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [fitOpen]);
  const fitDetail = React.useMemo(() => {
    let s = 0;
    const lines: string[] = [];
    const bon = m.bonuses || {};
    const strat = autoStrategy;
    const weight = (key: string, v: number) => {
      const base = v;
      if (strat === "max-repair" && /repair|integrity/i.test(key))
        return base * 1.5;
      if (strat === "max-signal" && /signal/i.test(key)) return base * 1.5;
      if (strat === "max-morale" && /morale|fatigue/i.test(key))
        return base * 1.5;
      return base;
    };
    for (const [kk, vv] of Object.entries(bon)) {
      if (typeof vv !== "number") continue;
      const wv = weight(kk, vv);
      s += wv;
      if (wv !== vv)
        lines.push(`${humanizeKey(kk)} ${pct(vv)} ×1.5 = ${pct(wv)}`);
      else lines.push(`${humanizeKey(kk)} ${pct(vv)}`);
    }
    let needBoost = 0;
    if (fits.some((f) => uncoveredNeeds?.has(f))) {
      s += 0.05;
      needBoost = 0.05;
      lines.push(`Covers need +${Math.round(needBoost * 100)}`);
    }
    const upkeep = Number((m as any).upkeep || 0);
    let upkeepPenalty = 0;
    if (upkeep > 0) {
      upkeepPenalty = Math.min(0.05, upkeep * 0.005);
      s -= upkeepPenalty;
      lines.push(`Upkeep penalty -${Math.round(upkeepPenalty * 100)}`);
    }
    const dis = (m as any).disadvantages || {};
    const hasDis = Object.values(dis).some(Boolean);
    if (hasDis) {
      s -= 0.02;
      lines.push(`Disadvantages penalty -2`);
    }
    const fitScore = Math.max(0, Math.round(s * 100));
    return { fitScore, lines };
  }, [
    m.bonuses,
    (m as any).disadvantages,
    (m as any).upkeep,
    fits,
    uncoveredNeeds,
    autoStrategy,
  ]);
  const score = React.useMemo(() => {
    let s = 0;
    const bon = m.bonuses || {};
    for (const v of Object.values(bon))
      if (typeof v === "number") s += v as number;
    if (fits.some((f) => uncoveredNeeds?.has(f))) s += 0.05;
    const upkeep = Number((m as any).upkeep || 0);
    if (upkeep > 0) s -= Math.min(0.05, upkeep * 0.005);
    const dis = (m as any).disadvantages || {};
    const hasDis = Object.values(dis).some(Boolean);
    if (hasDis) s -= 0.02;
    return Math.max(0, Math.round(s * 100));
  }, [
    m.bonuses,
    fits,
    uncoveredNeeds,
    (m as any).upkeep,
    (m as any).disadvantages,
  ]);
  return (
    <div className="rounded border overflow-hidden w-full max-w-[240px] sm:max-w-[260px] md:max-w-[280px] lg:max-w-[300px]">
      {m.image_url ? (
        <div className="relative w-full aspect-[4/3] bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.image_url}
            alt={m.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="p-3 space-y-2 text-sm break-words">
        <div className="flex items-center justify-between relative">
          <div className="font-medium break-words pr-2">{m.name}</div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {m.role || "Crew"}
            </span>
            <button
              type="button"
              className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
              title="Fit score"
              onClick={() => setFitOpen((v) => !v)}
            >
              Fit {score}
            </button>
            {fitOpen ? (
              <div
                ref={fitRef}
                className="absolute z-10 top-full right-0 mt-1 w-64 rounded border bg-card text-card-foreground p-2 shadow"
              >
                <div className="text-[10px] space-y-1">
                  <div className="font-medium">Fit breakdown</div>
                  {fitDetail.lines.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                  <div className="pt-1">Final: {fitDetail.fitScore}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Tier {m.tier}</div>
        {fits.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {fits.map((f) => (
              <span
                key={f}
                className={`${uncoveredNeeds?.has(f) ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted"} rounded px-1.5 py-0.5 text-[10px]`}
              >
                {humanizeKey(f)}
                {uncoveredNeeds?.has(f) ? " • Needed" : ""}
              </span>
            ))}
          </div>
        ) : null}
        {typeof m.cost === "number" ? (
          <div className="text-xs text-muted-foreground">Cost: {m.cost}</div>
        ) : null}
        {m.description ? (
          <div className="text-xs text-muted-foreground">{m.description}</div>
        ) : null}
        {m.bonuses && Object.keys(m.bonuses).length > 0 ? (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground">Bonuses</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(m.bonuses).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                >
                  {humanizeKey(k)} {typeof v === "number" ? pct(v) : String(v)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {m.feats && Object.entries(m.feats).some(([, val]) => !!val) ? (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground">Feats</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(m.feats)
                .filter(([, val]) => !!val)
                .map(([k]) => (
                  <span
                    key={k}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                  >
                    {humanizeKey(k)}
                  </span>
                ))}
            </div>
          </div>
        ) : null}
        {m.disadvantages &&
        Object.entries(m.disadvantages).some(([, val]) => !!val) ? (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground">
              Disadvantages
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(m.disadvantages)
                .filter(([, val]) => !!val)
                .map(([k]) => (
                  <span
                    key={k}
                    className="rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 text-[10px]"
                  >
                    {humanizeKey(k)}
                  </span>
                ))}
            </div>
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!canHire || active}
            variant={active ? "secondary" : "default"}
            onClick={onHire}
          >
            {active ? "Hired" : "Hire"}
          </Button>
        </div>
      </div>
    </div>
  );
}
