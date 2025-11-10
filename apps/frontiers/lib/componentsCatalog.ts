import type { ShipComponent } from "@/schemas/ship_components";

export type ComponentKind = {
  id: string;
  name: string;
  description?: string;
  tier?: number;
  // Effects at level 1
  base?: Record<string, number>;
  // Per-level incremental effects (applied for levels > 1)
  perLevel?: Record<string, number>;
  // Economics
  upgradeCostBase?: number; // base cost to upgrade from level N to N+1
  upgradeCostGrowth?: number; // per-level additive growth
  replaceCost?: number; // flat cost to install/replace to this kind
};

export const COMPONENT_CATALOG: Record<ShipComponent["slot"], ComponentKind[]> =
  {
    hull: [
      {
        id: "plating_mk1",
        name: "Hull Plating Mk I",
        description: "Standard alloy plating.",
        tier: 1,
        base: { integrity_upkeep: 0.01 },
        perLevel: { integrity_upkeep: 0.005 },
        upgradeCostBase: 40,
        upgradeCostGrowth: 10,
        replaceCost: 60,
      },
      {
        id: "plating_mk2",
        name: "Hull Plating Mk II",
        description: "Improved reinforcement and impact resistance.",
        tier: 2,
        base: { integrity_upkeep: 0.02, repair_bonus: 0.005 },
        perLevel: { integrity_upkeep: 0.0075 },
        upgradeCostBase: 60,
        upgradeCostGrowth: 15,
        replaceCost: 80,
      },
      {
        id: "adaptive_armor",
        name: "Adaptive Armor",
        description: "Smart materials that adapt to incoming damage.",
        tier: 3,
        base: { integrity_upkeep: 0.03, repair_bonus: 0.01 },
        perLevel: { integrity_upkeep: 0.01 },
        upgradeCostBase: 80,
        upgradeCostGrowth: 20,
        replaceCost: 120,
      },
    ],
    engine: [
      {
        id: "ion_drive",
        name: "Ion Drive",
        description: "Reliable sublight propulsion.",
        tier: 1,
        base: { route_efficiency: 0.01 },
        perLevel: { route_efficiency: 0.005 },
        upgradeCostBase: 40,
        upgradeCostGrowth: 10,
        replaceCost: 60,
      },
      {
        id: "fusion_burn",
        name: "Fusion Burn",
        description: "High-thrust fusion-stage engines.",
        tier: 2,
        base: { route_efficiency: 0.02, fatigue_reduction: 0.005 },
        perLevel: { route_efficiency: 0.0075 },
        upgradeCostBase: 60,
        upgradeCostGrowth: 15,
        replaceCost: 90,
      },
      {
        id: "warp_coils",
        name: "Warp Coils",
        description: "Faster-than-light capable coils.",
        tier: 3,
        base: { route_efficiency: 0.03, fatigue_reduction: 0.01 },
        perLevel: { route_efficiency: 0.01 },
        upgradeCostBase: 90,
        upgradeCostGrowth: 20,
        replaceCost: 140,
      },
    ],
    comms: [
      {
        id: "broadband_array",
        name: "Broadband Array",
        description: "Wide-spectrum communications array.",
        tier: 1,
        base: { signal_yield: 0.01 },
        perLevel: { signal_yield: 0.005 },
        upgradeCostBase: 35,
        upgradeCostGrowth: 10,
        replaceCost: 50,
      },
      {
        id: "encrypted_relay",
        name: "Encrypted Relay",
        description: "Secure relay with improved clarity.",
        tier: 2,
        base: { signal_yield: 0.015, signal_clarity: 0.01 },
        perLevel: { signal_yield: 0.006 },
        upgradeCostBase: 55,
        upgradeCostGrowth: 12,
        replaceCost: 75,
      },
      {
        id: "quantum_link",
        name: "Quantum Link",
        description: "Near-instant quantum entanglement link.",
        tier: 3,
        base: { signal_yield: 0.02, signal_clarity: 0.02 },
        perLevel: { signal_yield: 0.008 },
        upgradeCostBase: 80,
        upgradeCostGrowth: 20,
        replaceCost: 120,
      },
    ],
    aux: [
      {
        id: "power_coupler",
        name: "Power Coupler",
        description: "Stabilized power routing.",
        tier: 1,
        base: { repair_bonus: 0.005 },
        perLevel: { repair_bonus: 0.003 },
        upgradeCostBase: 30,
        upgradeCostGrowth: 8,
        replaceCost: 45,
      },
      {
        id: "battery_bank",
        name: "Battery Bank",
        description: "Extra reserve power storage.",
        tier: 2,
        base: { repair_bonus: 0.0075, route_efficiency: 0.005 },
        perLevel: { repair_bonus: 0.0035 },
        upgradeCostBase: 45,
        upgradeCostGrowth: 10,
        replaceCost: 65,
      },
      {
        id: "field_amplifier",
        name: "Field Amplifier",
        description: "Enhances subsystem effectiveness.",
        tier: 3,
        base: { repair_bonus: 0.01, signal_clarity: 0.01 },
        perLevel: { repair_bonus: 0.004 },
        upgradeCostBase: 65,
        upgradeCostGrowth: 15,
        replaceCost: 95,
      },
    ],
    scanner: [
      {
        id: "pulse_scanner",
        name: "Pulse Scanner",
        description: "Short-range active scanning.",
        tier: 1,
        base: { signal_clarity: 0.01 },
        perLevel: { signal_clarity: 0.005 },
        upgradeCostBase: 35,
        upgradeCostGrowth: 8,
        replaceCost: 50,
      },
      {
        id: "spectral_scanner",
        name: "Spectral Scanner",
        description: "Spectral analysis for richer signals.",
        tier: 2,
        base: { signal_clarity: 0.015, signal_yield: 0.005 },
        perLevel: { signal_clarity: 0.006 },
        upgradeCostBase: 55,
        upgradeCostGrowth: 12,
        replaceCost: 80,
      },
      {
        id: "deep_scan",
        name: "Deep Scan Array",
        description: "High-precision long-range scans.",
        tier: 3,
        base: { signal_clarity: 0.02, signal_yield: 0.01 },
        perLevel: { signal_clarity: 0.008 },
        upgradeCostBase: 75,
        upgradeCostGrowth: 18,
        replaceCost: 120,
      },
    ],
    weapon: [
      {
        id: "railgun",
        name: "Railgun",
        description: "Kinetic mass driver.",
        tier: 1,
        base: {},
        perLevel: {},
        upgradeCostBase: 40,
        upgradeCostGrowth: 10,
        replaceCost: 70,
      },
      {
        id: "beam_lance",
        name: "Beam Lance",
        description: "High-energy beam projector.",
        tier: 2,
        base: {},
        perLevel: {},
        upgradeCostBase: 60,
        upgradeCostGrowth: 15,
        replaceCost: 90,
      },
      {
        id: "missile_bay",
        name: "Missile Bay",
        description: "Guided munitions platform.",
        tier: 2,
        base: {},
        perLevel: {},
        upgradeCostBase: 60,
        upgradeCostGrowth: 15,
        replaceCost: 90,
      },
    ],
  };

export function getKindsForSlot(slot: ShipComponent["slot"]): ComponentKind[] {
  return COMPONENT_CATALOG[slot] || [];
}

export function isKindAllowed(
  slot: ShipComponent["slot"],
  kind: string,
): boolean {
  return getKindsForSlot(slot).some((k) => k.id === kind);
}

export function getKind(
  slot: ShipComponent["slot"],
  kind: string,
): ComponentKind | undefined {
  return getKindsForSlot(slot).find((k) => k.id === kind);
}

export function computeKindStats(
  kind: ComponentKind | undefined,
  level: number,
): Record<string, number> {
  if (!kind) return {};
  const base = kind.base || {};
  const per = kind.perLevel || {};
  const lvl = Math.max(1, Number(level || 1));
  const extra =
    lvl > 1
      ? Object.fromEntries(
          Object.entries(per).map(([k, v]) => [k, (v || 0) * (lvl - 1)]),
        )
      : {};
  const out: Record<string, number> = { ...base };
  for (const [k, v] of Object.entries(extra)) out[k] = (out[k] || 0) + (v || 0);
  return out;
}

export function computeUpgradeCost(
  kind: ComponentKind | undefined,
  currentLevel: number,
): number {
  if (!kind) return 0;
  const base = Number(kind.upgradeCostBase || 0);
  const growth = Number(kind.upgradeCostGrowth || 0);
  const lvl = Math.max(1, Number(currentLevel || 1));
  return Math.max(0, Math.round(base + growth * lvl));
}

export function computeReplaceCost(kind: ComponentKind | undefined): number {
  if (!kind) return 0;
  return Math.max(0, Math.round(Number(kind.replaceCost || 0)));
}
