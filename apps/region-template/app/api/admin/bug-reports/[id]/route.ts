import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import { regionAdmins } from "@workspace/store/utils/nav";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";
import { createClient } from "@supabase/supabase-js";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user)
    return { supabase, userId: null as string | null };
  const callerProfile = await getProfileByUserId(userData.user.id);
  const role = callerProfile?.access_role as any | undefined;
  const authorized =
    !!role && (regionAdmins.includes(role) || role === "dispatcher_admin");
  return { supabase, userId: userData.user.id as string, authorized };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase, authorized } = await requireAdmin();
    if (!authorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { data, error } = await supabase
      .from("bug_reports")
      .select(
        "id, created_at, created_by, title, area, steps, expected, actual, status, priority, metadata",
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    if (!data)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ report: data });
  } catch (e: any) {
    return jsonError(e, 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase, authorized } = await requireAdmin();
    if (!authorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const update: Record<string, any> = {};
    for (const key of [
      "title",
      "area",
      "steps",
      "expected",
      "actual",
      "status",
      "priority",
      "metadata",
    ]) {
      if (key in body) update[key] = body[key];
    }
    if (Object.keys(update).length === 0)
      return NextResponse.json({ error: "No changes" }, { status: 400 });
    // Fetch current (pre-update) for comparison
    const { data: before, error: readErr } = await supabase
      .from("bug_reports")
      .select("id, created_by, title, area, status, priority")
      .eq("id", id)
      .single();
    if (readErr) throw readErr;

    const { data: after, error } = await supabase
      .from("bug_reports")
      .update(update)
      .eq("id", id)
      .select("id, created_by, title, area, status, priority")
      .single();
    if (error) throw error;

    // Fire-and-forget notifications for key changes
    (async () => {
      try {
        if (!after) return;
        const env = ensureSupabaseEnv("server");
        if (!env.serviceRoleKey) return;
        const admin = createClient(env.url, env.serviceRoleKey);

        // 1) Notify original reporter on status change
        if (before && after.created_by && before.status !== after.status) {
          await admin.rpc("create_notification_for_users", {
            p_title: "Bug Report Status Updated",
            p_user_ids: [after.created_by] as any,
            p_body: `${after.title} · ${before.status} → ${after.status}`,
            p_level: "info",
            p_channel: "system",
            p_link: `/admin/bug-reports/${after.id}`,
            p_sticky: false,
            p_expires_at: null,
            p_meta: null,
          });
        }

        // 2) Escalate to admins when priority becomes critical
        const wasCritical = before?.priority === "critical";
        const isCritical = after.priority === "critical";
        if (!wasCritical && isCritical) {
          const adminRoles = ["dispatcher_admin", ...regionAdmins] as string[];
          const { data: profs } = await admin
            .from("profiles")
            .select("user_id, access_role")
            .not("user_id", "is", null)
            .in("access_role", adminRoles as any);
          const allIds: string[] = (profs ?? [])
            .map((r: any) => r.user_id)
            .filter(Boolean);
          if (allIds.length) {
            await admin.rpc("create_notification_for_users", {
              p_title: "Critical Bug Report",
              p_user_ids: allIds as any,
              p_body: `${after.title} · Area: ${after.area}`,
              p_level: "error",
              p_channel: "system",
              p_link: `/admin/bug-reports/${after.id}`,
              p_sticky: false,
              p_expires_at: null,
              p_meta: null,
            });
          }
        }
      } catch (e) {
        console.warn("[admin/bug-reports] PATCH notify exception:", e);
      }
    })();

    return NextResponse.json({ id: after?.id });
  } catch (e: any) {
    return jsonError(e, 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase, authorized } = await requireAdmin();
    if (!authorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // Fetch for notification before deletion
    const { data: row } = await supabase
      .from("bug_reports")
      .select("id, created_by, title")
      .eq("id", id)
      .single();
    const { error } = await supabase.from("bug_reports").delete().eq("id", id);
    if (error) throw error;

    // Optional: notify reporter that the report was deleted
    if (row?.created_by) {
      (async () => {
        try {
          const env = ensureSupabaseEnv("server");
          if (!env.serviceRoleKey) return;
          const admin = createClient(env.url, env.serviceRoleKey);
          await admin.rpc("create_notification_for_users", {
            p_title: "Bug Report Removed",
            p_user_ids: [row.created_by] as any,
            p_body: `${row.title} was removed by an administrator`,
            p_level: "warning",
            p_channel: "system",
            p_link: null,
            p_sticky: false,
            p_expires_at: null,
            p_meta: null,
          });
        } catch (e) {
          console.warn("[admin/bug-reports] DELETE notify exception:", e);
        }
      })();
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e, 500);
  }
}
