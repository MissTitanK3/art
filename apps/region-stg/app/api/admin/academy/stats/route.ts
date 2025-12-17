import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { getProfileByUserId, getAcademyStats } from "@/lib/dal/admin";
import { regionAdmins } from "@workspace/store/utils/nav";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user)
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized =
      !!callerAccessRole &&
      (regionAdmins.includes(callerAccessRole) ||
        callerAccessRole === "dispatcher_admin");
    if (!authorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stats = await getAcademyStats();
    return NextResponse.json({ stats });
  } catch (e: any) {
    return jsonError(e);
  }
}
