import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import { regionAdmins } from "@workspace/store/utils/nav";
import {
  ADMIN_GROUP_ROLES,
  notifyUsers,
  resolveRecipientsByRoles,
} from "@/lib/server/notify";

type PatchBody = Partial<{
  flagged: boolean;
  status: string;
}>;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const body = (await req.json()) as PatchBody;
    const updates: any = {};
    if (typeof body.flagged === "boolean") updates.flagged = body.flagged;
    if (typeof body.status === "string") updates.status = body.status;
    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });

    const client = await createSupabaseServerClient();

    const { id } = await params;
    // Load current before update for change detection
    const { data: beforeRows } = await client
      .from("dispatch_submissions")
      .select("*")
      .eq("id", id)
      .limit(1);
    const before = Array.isArray(beforeRows)
      ? beforeRows[0]
      : (beforeRows as any);

    const { data, error } = await client
      .from("dispatch_submissions")
      .update(updates)
      .eq("id", id)
      .select("*")
      .limit(1);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);

    // Fire-and-forget notifications
    (async () => {
      try {
        // Notify submitter on status changes
        if (before && row && before.status !== row.status && row.submitted_by) {
          await notifyUsers({
            title: "Dispatch Status Updated",
            body: `${before.status} → ${row.status}`,
            level: "info",
            channel: "dispatch",
            link: `/dispatches/submission/${row.id}`,
            recipients: [row.submitted_by],
          });
        }

        // Escalate when flagged becomes true
        if (
          before &&
          row &&
          before.flagged !== row.flagged &&
          row.flagged === true
        ) {
          const recipients = await resolveRecipientsByRoles({
            roles: ADMIN_GROUP_ROLES,
            channel: "dispatch",
          });
          if (recipients.length) {
            await notifyUsers({
              title: "Dispatch Flagged for Review",
              body: `A dispatch requires admin attention`,
              level: "warning",
              channel: "dispatch",
              link: `/dispatches/submission/${row.id}`,
              recipients,
            });
          }
        }
      } catch (e) {
        console.warn("[admin/dispatches] PATCH notify exception:", e);
      }
    })();

    return NextResponse.json({ submission: row ?? null });
  } catch (e: any) {
    return jsonError(e);
  }
}
