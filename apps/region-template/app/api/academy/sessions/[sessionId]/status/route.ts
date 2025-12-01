import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/responses";
import {
  createSupabaseServerClient,
  createSupabaseRegionServiceClient,
} from "@/lib/auth/supabase/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import { evaluateAccess } from "@workspace/store/utils/permissions/unifiedEngine";
import { hydratePermissionsContext } from "@workspace/store/utils/permissions/hydrateContext";
import type { NavRole } from "@workspace/store/utils/permissions/types";

const STATUS_VALUES = new Set([
  "scheduled",
  "in_progress",
  "completed",
  "archived",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "SESSION_ID_REQUIRED" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const nextStatus = typeof body?.status === "string" ? body.status : "";
    if (!STATUS_VALUES.has(nextStatus)) {
      return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userData.user.id);
    if (!profile) {
      return NextResponse.json({ error: "PROFILE_REQUIRED" }, { status: 403 });
    }

    const permissionsContext = await hydratePermissionsContext(
      supabase,
      userData.user.id,
      profile.id,
    );
    const { access } = evaluateAccess("manage_sessions", {
      ...permissionsContext,
      navRole: profile.access_role as NavRole | undefined,
    });
    if (!access) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const serviceClient = createSupabaseRegionServiceClient();
    const { data, error } = await serviceClient
      .from("academy_sessions")
      .update({ status: nextStatus })
      .eq("id", sessionId)
      .select("id, status")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, sessionId: data.id, status: data.status });
  } catch (error) {
    return jsonError(error);
  }
}
