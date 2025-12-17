import { NextResponse } from "next/server";

import {
  createSupabaseRegionServiceClient,
  createSupabaseServerClient,
} from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { REGION_IDENTIFIER } from "@/app/brand_settings";
import { getProfileByUserId } from "@/lib/dal/admin";

const DEFAULT_POLL_NOTE =
  "Polls only record a title and votes. Keep sensitive context in secure channels and document details in the organization.";

async function getCallerProfileId() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { errorResponse: NextResponse.json({ message: "AUTH_REQUIRED" }, { status: 401 }) };
  }
  const profile = await getProfileByUserId(userData.user.id);
  return { profileId: profile?.id ?? userData.user.id };
}

async function assertOrgManageAccess(orgId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { errorResponse: NextResponse.json({ message: "AUTH_REQUIRED" }, { status: 401 }) };
  }

  const profile = await getProfileByUserId(userData.user.id);
  if (!profile?.id) {
    return { errorResponse: NextResponse.json({ message: "PROFILE_REQUIRED" }, { status: 403 }) };
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("organization_roles")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (roleError) throw roleError;

  const elevated = new Set<string>([
    "dispatcher_admin",
    "regional_admin",
    "national_admin",
  ]);
  const callerRole = (roleRow?.role as string | null) ?? profile.access_role;
  const canManage =
    callerRole === "owner" ||
    callerRole === "admin" ||
    (callerRole && elevated.has(callerRole));
  if (!canManage) {
    return { errorResponse: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { profileId: profile.id };
}

async function assertOrgInRegion(orgId: string) {
  const supabase = createSupabaseRegionServiceClient();
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, region_id")
    .eq("id", orgId)
    .is("deleted_at", null)
    .maybeSingle();
  if (orgError) throw orgError;
  if (!org || org.region_id !== REGION_IDENTIFIER) {
    return { errorResponse: NextResponse.json({ message: "Organization not found for this region" }, { status: 404 }) };
  }
  return { supabase };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) {
      return NextResponse.json({ message: "orgId is required" }, { status: 400 });
    }

    const { supabase, errorResponse } = await assertOrgInRegion(orgId);
    if (errorResponse) return errorResponse;

    const { data, error } = await supabase
      .from("organization_polls")
      .select(
        "id, org_id, title, status, closes_at, allow_multiple, note, created_by, created_at, updated_at, options:organization_poll_options (id, label, emoji, position, votes_count)"
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const polls = (data ?? []).map((poll: any) => ({
      ...poll,
      options: (poll.options ?? []).sort(
        (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
      ),
      note: poll.note ?? DEFAULT_POLL_NOTE,
      allow_multiple: poll.allow_multiple ?? false,
    }));

    return NextResponse.json(polls);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, title, options, closesAt, note, allowMultiple } = body ?? {};
    if (!orgId || !title || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { message: "orgId, title, and options are required" },
        { status: 400 },
      );
    }

    const { supabase, errorResponse } = await assertOrgInRegion(orgId);
    if (errorResponse) return errorResponse;

    const { profileId } = await assertOrgManageAccess(orgId);
    const pollId = crypto.randomUUID();

    const { error: pollError } = await supabase.from("organization_polls").insert({
      id: pollId,
      org_id: orgId,
      title,
      status: "open",
      closes_at: closesAt ?? null,
      allow_multiple: allowMultiple ?? false,
      note: note ?? DEFAULT_POLL_NOTE,
      created_by: profileId ?? null,
    });
    if (pollError) throw pollError;

    const optionRows = (options as any[]).map((opt, idx) => ({
      id: crypto.randomUUID(),
      poll_id: pollId,
      label: opt?.label ?? "Option",
      emoji: opt?.emoji ?? null,
      position: idx,
      votes_count: 0,
    }));
    const { error: optionError } = await supabase
      .from("organization_poll_options")
      .insert(optionRows);
    if (optionError) throw optionError;

    return NextResponse.json({
      id: pollId,
      org_id: orgId,
      title,
      status: "open",
      closes_at: closesAt ?? null,
      note: note ?? DEFAULT_POLL_NOTE,
      created_by: profileId ?? null,
      options: optionRows,
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orgId, pollId, status } = body ?? {};
    if (!orgId || !pollId || !status) {
      return NextResponse.json(
        { message: "orgId, pollId, and status are required" },
        { status: 400 },
      );
    }
    if (!["open", "closed", "archived"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const { supabase, errorResponse } = await assertOrgInRegion(orgId);
    if (errorResponse) return errorResponse;

    const { errorResponse: manageError } = await assertOrgManageAccess(orgId);
    if (manageError) return manageError;

    const { error } = await supabase
      .from("organization_polls")
      .update({ status })
      .eq("id", pollId)
      .eq("org_id", orgId);
    if (error) throw error;

    return NextResponse.json({ orgId, pollId, status });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const pollId = searchParams.get("pollId");

    if (!orgId || !pollId) {
      return NextResponse.json(
        { message: "orgId and pollId are required" },
        { status: 400 },
      );
    }

    const { supabase, errorResponse } = await assertOrgInRegion(orgId);
    if (errorResponse) return errorResponse;

    const { errorResponse: manageError } = await assertOrgManageAccess(orgId);
    if (manageError) return manageError;

    const { error } = await supabase
      .from("organization_polls")
      .delete()
      .eq("id", pollId)
      .eq("org_id", orgId);
    if (error) throw error;

    return NextResponse.json({ orgId, pollId });
  } catch (e) {
    return jsonError(e);
  }
}
