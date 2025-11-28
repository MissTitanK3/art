import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const [, token] = auth.split(" ");
  return token && token === process.env.INTERNAL_KEY;
}

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

type Payload = {
  source_id: string;
  hop?: number;
  strength?: number;
};

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  const sourceId = body.source_id;
  if (!sourceId)
    return NextResponse.json({ error: "Missing source_id" }, { status: 400 });
  if (!isUUID(sourceId))
    return NextResponse.json({ error: "source_id must be a UUID" }, { status: 400 });

  const startHop = Number.isFinite(body.hop) ? (body.hop as number) : 0;
  const baseStrength =
    typeof body.strength === "number" ? (body.strength as number) : 1.0;

  const MAX_HOP = 3;
  const CAP = 50;
  const EXPIRES = new Date(Date.now() + 86_400_000).toISOString();

  let hop = Math.max(0, Math.min(MAX_HOP, startHop));
  let currentIds: string[] = [sourceId];
  let visited = new Set<string>(currentIds);
  let inserted = 0;

  while (hop < MAX_HOP && inserted < CAP && currentIds.length > 0) {
    // Find neighbors for all current ids (treat connections as undirected)
    const { data: rows1, error: e1 } = await supabase
      .from("connections")
      .select("source_id,target_id")
      .in("source_id", currentIds);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    const { data: rows2, error: e2 } = await supabase
      .from("connections")
      .select("source_id,target_id")
      .in("target_id", currentIds);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    const neighborSet = new Set<string>();
    const currentSet = new Set(currentIds);

    for (const r of [...(rows1 || []), ...(rows2 || [])]) {
      if (currentSet.has(r.source_id)) neighborSet.add(r.target_id);
      if (currentSet.has(r.target_id)) neighborSet.add(r.source_id);
    }

    // Next hop recipients excluding visited
    let nextRecipients = Array.from(neighborSet).filter(
      (id) => !visited.has(id),
    );
    if (nextRecipients.length === 0) break;

    const nextHop = hop + 1;
    const strength = baseStrength * Math.pow(0.75, nextHop);
    const remaining = CAP - inserted;
    const batch = nextRecipients.slice(0, remaining).map((rid) => ({
      source_id: sourceId,
      recipient_id: rid,
      hop: nextHop,
      strength,
      expires_at: EXPIRES,
    }));

    if (batch.length > 0) {
      const { error: insErr } = await supabase
        .from("resonance_effects")
        .insert(batch);
      if (insErr)
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      inserted += batch.length;
    }

    nextRecipients.forEach((id) => visited.add(id));
    currentIds = nextRecipients;
    hop = nextHop;
  }

  return NextResponse.json({ ok: true, inserted, hop });
}
