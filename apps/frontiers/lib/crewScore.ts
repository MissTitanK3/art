import type { CrewCatalog } from "@/schemas/crew";

export type AutoStrategy =
  | "balanced"
  | "max-repair"
  | "max-signal"
  | "max-morale";

function weightFor(strategy: AutoStrategy, key: string, v: number): number {
  if (strategy === "max-repair" && /repair|integrity/i.test(key))
    return v * 1.5;
  if (strategy === "max-signal" && /signal/i.test(key)) return v * 1.5;
  if (strategy === "max-morale" && /morale|fatigue/i.test(key)) return v * 1.5;
  return v;
}

export function computeCrewFit(
  m: CrewCatalog,
  strategy: AutoStrategy,
  uncoveredNeeds?: Set<string>,
): { score: number; lines: string[] } {
  let s = 0;
  const lines: string[] = [];
  const bon = m.bonuses || {};
  for (const [kk, vv] of Object.entries(bon)) {
    if (typeof vv !== "number") continue;
    const wv = weightFor(strategy, kk, vv);
    s += wv;
    if (wv !== vv)
      lines.push(
        `${kk} ${Math.round(vv * 100)}% ×1.5 = ${Math.round(wv * 100)}%`,
      );
    else lines.push(`${kk} ${Math.round(vv * 100)}%`);
  }
  const fits = (m.allowed_positions || []).map(String);
  if (fits.some((f) => uncoveredNeeds?.has(f))) {
    s += 0.05;
    lines.push(`Covers need +5`);
  }
  const upkeep = Number((m as any).upkeep || 0);
  if (upkeep > 0) {
    const pen = Math.min(0.05, upkeep * 0.005);
    s -= pen;
    lines.push(`Upkeep penalty -${Math.round(pen * 100)}`);
  }
  const dis = (m as any).disadvantages || {};
  const hasDis = Object.values(dis).some(Boolean);
  if (hasDis) {
    s -= 0.02;
    lines.push(`Disadvantages penalty -2`);
  }
  return { score: Math.max(0, s), lines };
}
