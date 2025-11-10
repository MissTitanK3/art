import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Derived ship state includes base state + staffing bonuses
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get("profile_id");
  const shipId = url.searchParams.get("ship_id");
  if (!profileId)
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });

  const { data: base, error: e0 } = await supabase
    .from("ship_states")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });

  // If shipId not provided, get current selected ship for profile
  let currentShipId = shipId;
  if (!currentShipId) {
    const { data: cur, error: e1 } = await supabase
      .from("profile_ships")
      .select("ship_id")
      .eq("profile_id", profileId)
      .maybeSingle();
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    currentShipId = (cur as any)?.ship_id || null;
  }

  // Aggregate staffing bonuses
  let bonuses = {
    repair_bonus: 0,
    integrity_upkeep: 0,
    fatigue_reduction: 0,
    route_efficiency: 0,
    signal_yield: 0,
    signal_clarity: 0,
    morale_recovery: 0,
  };
  const breakdown: {
    items: Array<{
      type: "crew" | "position";
      id: string;
      name?: string;
      contributions: Record<string, number>;
    }>;
    auras: string[];
    sets?: string[];
  } = { items: [], auras: [], sets: [] };
  if (currentShipId) {
    const { data: staffed, error: e2 } = await supabase
      .from("profile_ship_positions")
      .select(
        "position_id, crew:crew_catalog(id,name,bonuses), position:positions_catalog(id,name,department,base_bonuses)",
      )
      .eq("profile_id", profileId)
      .eq("ship_id", currentShipId);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    const hasChiefEngineer = (staffed || []).some(
      (s: any) => (s as any)?.position?.id === "chief_engineer",
    );
    const hasNavChief = (staffed || []).some(
      (s: any) => (s as any)?.position?.id === "navigator_in_chief",
    );
    const hasCommsLead = (staffed || []).some(
      (s: any) => (s as any)?.position?.id === "comms_lead",
    );
    const hasCMO = (staffed || []).some(
      (s: any) => (s as any)?.position?.id === "chief_medical_officer",
    );
    const hasSecurityChief = (staffed || []).some(
      (s: any) => (s as any)?.position?.id === "security_chief",
    );
    const hasCSO = (staffed || []).some(
      (s: any) => (s as any)?.position?.id === "chief_science_officer",
    );

    const deptCounts: Record<string, number> = {};

    for (const s of (staffed as any[]) || []) {
      const crew = (s as any).crew || {};
      const pos = (s as any).position || {};
      if (pos?.department) {
        const d = String(pos.department);
        deptCounts[d] = (deptCounts[d] || 0) + 1;
      }
      const cb = (crew.bonuses || {}) as Record<string, number>;
      const crewContrib: Record<string, number> = {};
      for (const [k, v] of Object.entries(cb)) {
        const val = typeof v === "number" ? v : 0;
        bonuses[k as keyof typeof bonuses] = (bonuses as any)[k] + val;
        crewContrib[k] = (crewContrib[k] || 0) + val;
      }
      const pb = (pos.base_bonuses || {}) as Record<string, number>;
      const posContrib: Record<string, number> = {};
      for (const [k, v] of Object.entries(pb)) {
        const val = typeof v === "number" ? v : 0;
        bonuses[k as keyof typeof bonuses] = (bonuses as any)[k] + val;
        posContrib[k] = (posContrib[k] || 0) + val;
      }
      if (Object.keys(crewContrib).length > 0)
        breakdown.items.push({
          type: "crew",
          id: String(crew.id || ""),
          name: crew.name,
          contributions: crewContrib,
        });
      if (Object.keys(posContrib).length > 0)
        breakdown.items.push({
          type: "position",
          id: String(pos.id || ""),
          name: pos.name,
          contributions: posContrib,
        });
    }

    // Department head aura: Chief Engineer boosts engineering-related effects by +20%
    if (hasChiefEngineer) {
      const keys: (keyof typeof bonuses)[] = [
        "repair_bonus",
        "integrity_upkeep",
      ];
      for (const k of keys) bonuses[k] = (bonuses[k] || 0) * 1.2;
      breakdown.auras.push("Chief Engineer (+20% Engineering)");
    }
    if (hasNavChief) {
      bonuses.route_efficiency = (bonuses.route_efficiency || 0) * 1.15;
      bonuses.fatigue_reduction = (bonuses.fatigue_reduction || 0) * 1.1;
      breakdown.auras.push("Navigator-in-Chief (+15% Route, +10% Fatigue)");
    }
    if (hasCommsLead) {
      bonuses.signal_clarity = (bonuses.signal_clarity || 0) * 1.15;
      breakdown.auras.push("Comms Lead (+15% Clarity)");
    }
    if (hasCMO) {
      bonuses.morale_recovery = (bonuses.morale_recovery || 0) * 1.15;
      breakdown.auras.push("Chief Medical Officer (+15% Morale)");
    }
    if (hasSecurityChief) {
      bonuses.integrity_upkeep = (bonuses.integrity_upkeep || 0) * 1.1;
      breakdown.auras.push("Security Chief (+10% Integrity Upkeep)");
    }
    if (hasCSO) {
      bonuses.signal_yield = (bonuses.signal_yield || 0) * 1.1;
      breakdown.auras.push("Chief Science Officer (+10% Signal Yield)");
    }

    // Simple department set bonuses
    if ((deptCounts["Engineering"] || 0) >= 3) {
      bonuses.integrity_upkeep = (bonuses.integrity_upkeep || 0) + 0.02;
      breakdown.sets!.push("Engineering Set (3+): +2% Integrity Upkeep");
    }
    if ((deptCounts["Science"] || 0) >= 2) {
      bonuses.signal_clarity = (bonuses.signal_clarity || 0) + 0.02;
      breakdown.sets!.push("Science Set (2+): +2% Signal Clarity");
    }
    if ((deptCounts["Ops"] || 0) >= 2) {
      bonuses.route_efficiency = (bonuses.route_efficiency || 0) + 0.02;
      breakdown.sets!.push("Ops Set (2+): +2% Route Efficiency");
    }
    if ((deptCounts["Security"] || 0) >= 2) {
      bonuses.fatigue_reduction = (bonuses.fatigue_reduction || 0) + 0.02;
      breakdown.sets!.push("Security Set (2+): +2% Fatigue Reduction");
    }
    if ((deptCounts["Support"] || 0) >= 2) {
      bonuses.morale_recovery = (bonuses.morale_recovery || 0) + 0.02;
      breakdown.sets!.push("Support Set (2+): +2% Morale Recovery");
    }
  }

  // Apply bonuses to base where it makes sense for this endpoint
  // Keep this conservative: return both base and bonuses so UI can display clearly
  return NextResponse.json({
    base: base || null,
    bonuses,
    breakdown,
    ship_id: currentShipId,
  });
}
