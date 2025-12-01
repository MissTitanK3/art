import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function PATCH(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const availability =
      typeof body?.availability === "boolean" ? body.availability : undefined;
    const checkIn = Boolean(body?.checkIn);

    if (availability === undefined && !checkIn) {
      return NextResponse.json(
        { error: "NO_FIELDS" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const update: Record<string, any> = {};
    if (availability !== undefined) update.availability = availability;
    if (checkIn) update.last_profile_check_in = now;
    update.updated_at = now;

    const { data, error } = await supabase
      .from("profiles")
      .update(update)
      .or(`user_id.eq.${userData.user.id},id.eq.${userData.user.id}`)
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ profile: data });
  } catch (e) {
    return jsonError(e);
  }
}
