import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const position = url.searchParams.get("position");

  let query = supabase
    .from("crew_catalog")
    .select("*")
    .order("role", { ascending: true, nullsFirst: false })
    .order("tier", { ascending: true })
    .order("name", { ascending: true });

  if (position) {
    query = query.contains("allowed_positions", [position]);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ crew: data || [] });
}
