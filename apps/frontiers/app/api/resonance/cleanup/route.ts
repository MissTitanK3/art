import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST() {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("resonance_effects")
    .delete()
    .lt("expires_at", now);
  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}
