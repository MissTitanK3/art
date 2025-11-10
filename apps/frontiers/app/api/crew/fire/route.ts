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

  const { error } = await supabase
    .from("profile_crew")
    .update({ status: "inactive" })
    .eq("profile_id", profile_id)
    .eq("crew_id", crew_id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
