import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get("profile_id");
  if (!profileId)
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });
  const { data, error } = await supabase
    .from("profile_crew")
    .select("profile_id, crew_id, hired_at, status, crew:crew_catalog(*)")
    .eq("profile_id", profileId)
    .order("hired_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ crew: data || [] });
}
