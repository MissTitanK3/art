import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import { regionAdmins } from "@workspace/store/utils/nav";
import { createClient } from "@supabase/supabase-js";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";
import {
  ADMIN_GROUP_ROLES,
  notifyUsers,
  resolveRecipientsByRoles,
} from "@/lib/server/notify";

async function authorize() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return { ok: false as const, status: 401 };
  const callerProfile = await getProfileByUserId(userData.user.id);
  const callerAccessRole = callerProfile?.access_role as any | undefined;
  const authorized =
    !!callerAccessRole && regionAdmins.includes(callerAccessRole);
  if (!authorized) return { ok: false as const, status: 403 };
  return { ok: true as const };
}

function adminClient() {
  const env = ensureSupabaseEnv("server");
  const serviceKey = env.serviceRoleKey;
  if (!serviceKey) throw new Error("Service role not configured");
  return createClient(env.url, serviceKey);
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authorize();
    if (!auth.ok)
      return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

    const { id } = await params;
    const body = await _req.json().catch(() => ({}));
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    const normalizeContacts = (values: unknown) =>
      Array.isArray(values)
        ? (values as unknown[])
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter(Boolean)
        : null;
    for (const key of [
      "name",
      "type",
      "jurisdiction",
      "contact_emails",
      "contact_phones",
      "contact_faxes",
      "contact_signal",
      "preferred_format",
      "active_status",
      "notes",
    ]) {
      if (key in body) patch[key] = body[key];
    }
    if ("contact_emails" in patch)
      patch.contact_emails = normalizeContacts(patch.contact_emails);
    if ("contact_phones" in patch)
      patch.contact_phones = normalizeContacts(patch.contact_phones);
    if ("contact_faxes" in patch)
      patch.contact_faxes = normalizeContacts(patch.contact_faxes);

    const client = adminClient();
    const { data, error } = await client
      .from("advocacy_groups")
      .update(patch)
      .eq("id", id)
      .select("*");
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const updated = Array.isArray(data) ? data[0] : data;
    // Fire-and-forget: notify admins about important changes
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({
          roles: ADMIN_GROUP_ROLES,
          channel: "system",
        });
        if (!recipients.length) return;
        const parts: string[] = [];
        if ("name" in patch) parts.push(`name → ${updated?.name ?? ""}`);
        if ("active_status" in patch)
          parts.push(`active → ${updated?.active_status ? "true" : "false"}`);
        if ("preferred_format" in patch)
          parts.push(`format → ${updated?.preferred_format ?? ""}`);
        if ("contact_emails" in patch) parts.push("contacts updated");
        if (parts.length) {
          await notifyUsers({
            title: "Advocacy Group Updated",
            body: `${updated?.name ?? id}: ${parts.join(" · ")}`,
            level: "info",
            channel: "system",
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn("[admin/advocacy-groups] PATCH notify exception:", e);
      }
    })();
    return NextResponse.json({ group: updated });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authorize();
    if (!auth.ok)
      return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
    const { id } = await params;
    const client = adminClient();
    const { error } = await client
      .from("advocacy_groups")
      .delete()
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    // Fire-and-forget: notify admins about deletion
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({
          roles: ADMIN_GROUP_ROLES,
          channel: "system",
        });
        if (recipients.length) {
          await notifyUsers({
            title: "Advocacy Group Deleted",
            body: `ID: ${id}`,
            level: "warning",
            channel: "system",
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn("[admin/advocacy-groups] DELETE notify exception:", e);
      }
    })();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e);
  }
}
