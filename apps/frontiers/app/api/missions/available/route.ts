import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// List available missions by gating requirements like staffed positions
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get("profile_id");
  const shipId = url.searchParams.get("ship_id");
  const campaignId = url.searchParams.get("campaign_id");
  if (!profileId)
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });

  // Load missions (optionally filter by campaign)
  let q = supabase.from("campaign_missions").select("*");
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data: missions, error: e0 } = await q;
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });

  // Determine staffed positions for gating and current ship tier/components
  let staffedPositions = new Set<string>();
  let shipTier: number | null = null;
  let components: Array<{ slot: string; kind: string; level: number }> = [];
  if (shipId) {
    const { data: staffed, error: e1 } = await supabase
      .from("profile_ship_positions")
      .select("position_id, crew_id")
      .eq("profile_id", profileId)
      .eq("ship_id", shipId);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    for (const s of staffed || []) {
      if ((s as any).crew_id)
        staffedPositions.add(String((s as any).position_id));
    }
    // Ship tier
    const { data: shipRow, error: e2 } = await supabase
      .from("profile_ships")
      .select("ship_id, ship:ship_catalog(tier)")
      .eq("profile_id", profileId)
      .eq("ship_id", shipId)
      .maybeSingle();
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    shipTier = Number((shipRow as any)?.ship?.tier || null);
    // Components by profile (current ship doesn’t track per-ship components yet, using profile-level for now)
    const { data: comps, error: e3 } = await supabase
      .from("ship_components")
      .select("slot, kind, level")
      .eq("profile_id", profileId);
    if (e3) return NextResponse.json({ error: e3.message }, { status: 500 });
    components = Array.isArray(comps) ? (comps as any) : [];
  }

  // Gate by required_actions: requires_positions (all), any_of_positions (any), min_ship_tier, required_components
  const available = (missions || []).map((m) => {
    const ra = ((m as any).required_actions || {}) as any;
    const reqPos: string[] = Array.isArray(ra.requires_positions)
      ? ra.requires_positions.map(String)
      : [];
    const anyOf: string[] = Array.isArray(ra.any_of_positions)
      ? ra.any_of_positions.map(String)
      : [];
    const minTier: number | null =
      typeof ra.min_ship_tier === "number" ? ra.min_ship_tier : null;
    const reqComps: Array<{ slot?: string; kind?: string; level?: number }> =
      Array.isArray(ra.required_components) ? ra.required_components : [];

    let ok = true;
    if (ok && reqPos.length > 0)
      ok = reqPos.every((p) => staffedPositions.has(p));
    if (ok && anyOf.length > 0) ok = anyOf.some((p) => staffedPositions.has(p));
    if (ok && minTier !== null) ok = (shipTier ?? 0) >= minTier;
    if (ok && reqComps.length > 0) {
      ok = reqComps.every((rc) => {
        return components.some(
          (c) =>
            (rc.slot ? c.slot === rc.slot : true) &&
            (rc.kind ? c.kind === rc.kind : true) &&
            (typeof rc.level === "number" ? c.level >= rc.level : true),
        );
      });
    }

    return {
      id: (m as any).id,
      title: (m as any).title,
      description: (m as any).description,
      available: ok,
    };
  });

  return NextResponse.json({ missions: available });
}
