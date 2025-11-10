import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get("profile_id");

  const { data: catalog, error: e1 } = await supabase
    .from("ship_catalog")
    .select("*")
    .order("tier", { ascending: true });
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  let days = 0;
  if (profileId) {
    // Days since first ship state or profile creation fallback
    const { data: st } = await supabase
      .from("ship_states")
      .select("last_update")
      .eq("profile_id", profileId)
      .maybeSingle();
    const start = st?.last_update ? new Date(st.last_update).getTime() : null;
    if (start) {
      const diff = Date.now() - start;
      days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }
  }

  const withEligibility = (catalog || []).map((c: any) => ({
    ...c,
    eligible: days >= (c.required_days || 0),
  }));
  return NextResponse.json({ ships: withEligibility, days });
}
