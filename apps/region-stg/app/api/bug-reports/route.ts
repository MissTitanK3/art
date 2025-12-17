import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";
import { createClient } from "@supabase/supabase-js";
import { regionAdmins } from "@workspace/store/utils/nav";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user)
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim();
    const area = String(body?.area || "general").trim();
    const steps = body?.steps ? String(body.steps) : null;
    const expected = body?.expected ? String(body.expected) : null;
    const actual = body?.actual ? String(body.actual) : null;

    if (!title || title.length < 5) {
      return NextResponse.json(
        { error: "Title is required (min 5 chars)" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("bug_reports")
      .insert({
        title,
        area,
        steps,
        expected,
        actual,
        created_by: userData.user.id,
        status: "open",
      })
      .select("id, created_at")
      .single();

    if (error) throw error;

    // Fire-and-forget: notify region admins about the new bug report.
    // Use service role to bypass RLS and resolve recipients by role, honoring notification prefs when available.
    (async () => {
      try {
        const env = ensureSupabaseEnv("server");
        if (!env.serviceRoleKey) return; // skip if not configured in this environment
        const admin = createClient(env.url, env.serviceRoleKey);

        // Resolve candidate recipients by role (admins_only preset)
        const adminRoles = ["dispatcher_admin", ...regionAdmins] as string[];
        const { data: profileRows } = await admin
          .from("profiles")
          .select("user_id, access_role")
          .not("user_id", "is", null)
          .in("access_role", adminRoles as any);
        const allIds: string[] = (profileRows ?? [])
          .map((r: any) => r.user_id)
          .filter(Boolean);
        if (allIds.length === 0) return;

        // Respect notification preferences when table exists
        let allowedIds = allIds;
        try {
          const { data: prefRows } = await admin
            .from("notification_prefs")
            .select("user_id, global_opt_out, muted_channels")
            .in("user_id", allIds as any);
          if (prefRows && prefRows.length > 0) {
            const muted = new Map<
              string,
              { global_opt_out: boolean; muted_channels: string[] }
            >();
            for (const p of prefRows) {
              muted.set(p.user_id, {
                global_opt_out: Boolean(p.global_opt_out),
                muted_channels: Array.isArray(p.muted_channels)
                  ? p.muted_channels
                  : [],
              });
            }
            const channel = "system";
            allowedIds = allIds.filter((uid) => {
              const pref = muted.get(uid);
              if (!pref) return true;
              if (pref.global_opt_out) return false;
              if (pref.muted_channels?.includes(channel)) return false;
              return true;
            });
          }
        } catch {
          // If prefs table not present, proceed with allIds
        }
        if (allowedIds.length === 0) return;

        const link = data?.id ? `/admin/bug-reports/${data.id}` : null;
        const { error: rpcErr } = await admin.rpc(
          "create_notification_for_users",
          {
            p_title: "New Bug Report Submitted",
            p_user_ids: allowedIds as any,
            p_body: `${title}${area ? ` · Area: ${area}` : ""}`,
            p_level: "info",
            p_channel: "system",
            p_link: link,
            p_sticky: false,
            p_expires_at: null,
            p_meta: null,
          },
        );
        if (rpcErr) {
          // swallow errors; logging only in server envs
          console.warn("[bug-reports] notify admins failed:", rpcErr.message);
        }
      } catch (e) {
        console.warn("[bug-reports] notify admins exception:", e);
      }
    })();

    return NextResponse.json(
      { id: data?.id, created_at: data?.created_at },
      { status: 201 },
    );
  } catch (e: any) {
    return jsonError(e);
  }
}
