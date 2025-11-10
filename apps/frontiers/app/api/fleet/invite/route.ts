import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

type Body = { source_id: string; target_id: string; trust?: number };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { source_id, target_id } = body;
  const trust =
    typeof body.trust === "number" ? Math.max(0, Math.min(1, body.trust)) : 0.7;
  if (!source_id || !target_id)
    return NextResponse.json({ error: "Missing ids" }, { status: 400 });

  // Mutual connection in legacy text graph
  const { error: e1 } = await supabase.from("connections").upsert(
    [
      { source_id, recipient_id: target_id },
      { source_id: target_id, recipient_id: source_id },
    ],
    { onConflict: "source_id,recipient_id" },
  );
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // Insert into v2 trust graph when both are UUIDs
  if (isUUID(source_id) && isUUID(target_id)) {
    await supabase.from("connections_v2").upsert(
      [
        { source_id, target_id, relation: "crew", trust },
        { source_id: target_id, target_id: source_id, relation: "crew", trust },
      ],
      { onConflict: "source_id,target_id" },
    );
  }

  return NextResponse.json({ ok: true });
}
