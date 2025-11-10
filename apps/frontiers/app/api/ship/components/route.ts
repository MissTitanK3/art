import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get("profile_id");
  if (!profileId)
    return NextResponse.json({ error: "Missing profile_id" }, { status: 400 });
  const { data, error } = await supabase
    .from("ship_components")
    .select("*")
    .eq("profile_id", profileId)
    .order("slot", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ components: data || [] });
}
