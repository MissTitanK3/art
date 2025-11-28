import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get("profile_id");
  if (!profileId)
    return NextResponse.json({ error: "Missing profile_id" }, { status: 400 });
  if (!isUUID(profileId))
    return NextResponse.json({ error: "profile_id must be a UUID" }, { status: 400 });

  const { data: rows1, error: e1 } = await supabase
    .from("connections")
    .select("source_id,target_id,trust")
    .eq("source_id", profileId);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const { data: rows2, error: e2 } = await supabase
    .from("connections")
    .select("source_id,target_id,trust")
    .eq("target_id", profileId);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  const neighbors = new Set<string>();
  const trustMap: Record<string, number> = {};
  for (const r of rows1 || []) {
    neighbors.add(r.target_id);
    trustMap[r.target_id] = Math.max(
      trustMap[r.target_id] || 0,
      Number(r.trust || 0),
    );
  }
  for (const r of rows2 || []) {
    neighbors.add(r.source_id);
    trustMap[r.source_id] = Math.max(
      trustMap[r.source_id] || 0,
      Number(r.trust || 0),
    );
  }
  neighbors.delete(profileId);
  const list = Array.from(neighbors);

  return NextResponse.json({
    crew: list.map((id) => ({ id, trust: trustMap[id] ?? null })),
  });
}
