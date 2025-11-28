import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

type Body = { source_id: string; target_id: string; trust: number };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { source_id, target_id } = body;
  let { trust } = body;
  if (!source_id || !target_id || typeof trust !== "number")
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  trust = Math.max(0, Math.min(1, trust));

  if (!(isUUID(source_id) && isUUID(target_id))) {
    return NextResponse.json(
      { ok: false, warning: "IDs must be UUIDs for trust graph" },
      { status: 200 },
    );
  }

  const { error } = await supabase.from("connections").upsert(
    [
      { source_id, target_id, relation: "crew", trust },
      { source_id: target_id, target_id: source_id, relation: "crew", trust },
    ],
    { onConflict: "source_id,target_id" },
  );
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
