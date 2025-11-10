import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type Body = { profile_id: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { profile_id } = body || ({} as any);
  if (!profile_id)
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });

  // Ensure there is a ship to abandon
  const { data: current, error: e0 } = await supabase
    .from("profile_ships")
    .select("profile_id, ship_id")
    .eq("profile_id", profile_id)
    .maybeSingle();
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
  if (!current)
    return NextResponse.json({ error: "No ship selected" }, { status: 400 });

  // 1) Clear current selection
  const { error: e1 } = await supabase
    .from("profile_ships")
    .delete()
    .eq("profile_id", profile_id);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // 2) Reward: crew morale buff and trust +1 along your graph (mild effect)
  try {
    // Buff ship morale up to 100 (or create ship state if missing)
    const { data: s } = await supabase
      .from("ship_states")
      .select("*")
      .eq("profile_id", profile_id)
      .maybeSingle();
    if (s) {
      await supabase
        .from("ship_states")
        .update({
          morale: Math.min(1, Number(s.morale || 0) + 0.1),
          last_update: new Date().toISOString(),
        })
        .eq("profile_id", profile_id);
    } else {
      await supabase
        .from("ship_states")
        .insert({ profile_id, ship_condition: 1, morale: 1, fatigue: 0 });
    }

    // Trust: +1 point (cap 1.0) along UUID edges where this profile participates
    const { data: peers1 } = await supabase
      .from("connections_v2")
      .select("source_id,target_id,trust")
      .eq("source_id", profile_id);
    const { data: peers2 } = await supabase
      .from("connections_v2")
      .select("source_id,target_id,trust")
      .eq("target_id", profile_id);
    const updates: any[] = [];
    for (const r of [...(peers1 || []), ...(peers2 || [])]) {
      const a = (r as any).source_id;
      const b = (r as any).target_id;
      const pair = [a, b];
      const cur = Math.max(0, Math.min(1, Number((r as any).trust || 0)));
      const next = Math.max(cur, Math.min(1, cur + 0.01));
      if (next !== cur) {
        updates.push({
          source_id: a,
          target_id: b,
          relation: "crew",
          trust: next,
        });
      }
    }
    if (updates.length) {
      await supabase
        .from("connections_v2")
        .upsert(updates, { onConflict: "source_id,target_id" });
    }
  } catch {}

  // Cost: small fatigue increase as disruption
  try {
    const { data: s } = await supabase
      .from("ship_states")
      .select("fatigue")
      .eq("profile_id", profile_id)
      .maybeSingle();
    if (s) {
      await supabase
        .from("ship_states")
        .update({
          fatigue: Math.min(1, Math.max(0, Number(s.fatigue || 0) + 0.05)),
          last_update: new Date().toISOString(),
        })
        .eq("profile_id", profile_id);
    }
  } catch {}

  return NextResponse.json({ ok: true });
}
