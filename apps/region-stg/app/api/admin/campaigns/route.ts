import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getProfileByUserId } from "@/lib/dal/admin";
import {
  createSupabaseServerClient,
  createSupabaseAdminServiceClient,
} from "@/lib/auth/supabase/server";
import { regionAdmins } from "@workspace/store/utils/nav";
import {
  ADMIN_GROUP_ROLES,
  notifyUsers,
  resolveRecipientsByRoles,
} from "@/lib/server/notify";

type PostBody = Partial<{
  title: string;
  region_id?: string | null;
  start_at?: string;
  end_at?: string;
  summary?: string;
  reward_schema?: any;
  art_link?: string;
}>;

export async function POST(req: Request) {
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

    const body = (await req.json()) as PostBody;
    const title = body.title?.trim();
    if (!title)
      return NextResponse.json({ error: "title is required" }, { status: 400 });

    // Use the admin database with service role for privileged writes
    const admin = createSupabaseAdminServiceClient();

    // Fetch caller region_id from admin profiles (regional Profile may not include region_id)
    const userId = userData.user.id;
    const { data: adminProfRows } = await admin
      .from("profiles")
      .select("region_id")
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .limit(1);
    const callerRegionId =
      Array.isArray(adminProfRows) && adminProfRows[0]?.region_id
        ? String((adminProfRows as any)[0].region_id)
        : null;

    const payload: any = {
      title,
      region_id: body.region_id ?? callerRegionId ?? null,
      start_at: body.start_at ?? new Date().toISOString(),
      end_at:
        body.end_at ??
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      summary: body.summary ?? null,
      reward_schema: body.reward_schema ?? null,
      art_link: body.art_link ?? null,
    };

    const { data, error } = await admin
      .from("campaigns")
      .insert(payload)
      .select("*")
      .limit(1);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    // Fire-and-forget: notify admins/leaders of new campaign
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({
          roles: ADMIN_GROUP_ROLES,
          groups: ["leaders"],
          channel: "system",
        });
        if (recipients.length) {
          await notifyUsers({
            title: "New Campaign Created",
            body: `${row?.title ?? "Untitled"}${row?.region_id ? ` · Region ${row.region_id}` : ""}`,
            level: "info",
            channel: "system",
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn("[admin/campaigns] POST notify exception:", e);
      }
    })();
    return NextResponse.json({ campaign: row });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function GET(_req: Request) {
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

    // Return upcoming + active from the admin database, scoped to region or global
    const nowIso = new Date().toISOString();
    const admin = createSupabaseAdminServiceClient();
    // Fetch caller region from admin DB
    const userId = userData.user.id;
    const { data: adminProfRows } = await admin
      .from("profiles")
      .select("region_id")
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .limit(1);
    const callerRegionId =
      Array.isArray(adminProfRows) && adminProfRows[0]?.region_id
        ? String((adminProfRows as any)[0].region_id)
        : null;
    let q = admin
      .from("campaigns")
      .select("*")
      .gte("end_at", nowIso)
      .order("start_at", { ascending: true });
    if (callerRegionId)
      q = q.or(`region_id.is.null,region_id.eq.${callerRegionId}`);
    const { data, error } = await q;
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaigns: Array.isArray(data) ? data : [] });
  } catch (e: any) {
    return jsonError(e);
  }
}
