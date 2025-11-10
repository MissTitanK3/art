import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type Body = { profile_id: string; crew_id: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { profile_id, crew_id } = body || ({} as any);
  if (!profile_id || !crew_id)
    return NextResponse.json(
      { error: "profile_id and crew_id required" },
      { status: 400 },
    );

  const { data: exists, error: e0 } = await supabase
    .from("crew_catalog")
    .select("id")
    .eq("id", crew_id)
    .maybeSingle();
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
  if (!exists)
    return NextResponse.json({ error: "Unknown crew_id" }, { status: 400 });

  const { error } = await supabase
    .from("profile_crew")
    .upsert(
      { profile_id, crew_id, status: "active" },
      { onConflict: "profile_id,crew_id" },
    );
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
