import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";
import { getProfileByUserId } from "@/lib/dal/admin";
import { createClient } from "@supabase/supabase-js";
import { regionAdmins } from "@workspace/store/utils/nav";

async function fetchReporterUsernames(
  fallbackClient: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  createdByList: (string | null | undefined)[],
) {
  const userIds = Array.from(
    new Set(
      createdByList.filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0,
      ),
    ),
  );
  if (userIds.length === 0) return new Map<string, string>();

  let client: any = fallbackClient;
  try {
    const env = ensureSupabaseEnv("server");
    if (env.serviceRoleKey) {
      client = createClient(env.url, env.serviceRoleKey);
    }
  } catch (e) {
    console.warn("[admin/bug-reports] service role unavailable", e);
  }

  try {
    const { data, error } = await client
      .from("profiles")
      .select("user_id, display_name, contact_signal")
      .in("user_id", userIds as any);
    if (error) throw error;
    const map = new Map<string, string>();
    for (const row of data ?? []) {
      const userId = row?.user_id;
      if (!userId) continue;
      const username = row?.contact_signal || row?.display_name || null;
      if (username) map.set(userId, username);
    }
    return map;
  } catch (e) {
    console.warn("[admin/bug-reports] reporter lookup failed", e);
    return new Map<string, string>();
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user)
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const callerProfile = await getProfileByUserId(userData.user.id);
    const role = callerProfile?.access_role as any | undefined;
    const authorized =
      !!role && (regionAdmins.includes(role) || role === "dispatcher_admin");
    if (!authorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const area = searchParams.get("area");

    let query = supabase
      .from("bug_reports")
      .select("id, created_at, created_by, title, area, status, priority");
    if (status) query = query.eq("status", status);
    if (area) query = query.eq("area", area);
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    const reports = Array.isArray(data) ? data : [];
    const reporterMap = await fetchReporterUsernames(
      supabase,
      reports.map((r) => r?.created_by),
    );
    const enriched = reports.map((row) => ({
      ...row,
      reporter_username: row?.created_by
        ? reporterMap.get(row.created_by) ?? null
        : null,
    }));
    return NextResponse.json({ reports: enriched });
  } catch (e: any) {
    return jsonError(e);
  }
}
