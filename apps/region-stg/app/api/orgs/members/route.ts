import { NextResponse } from "next/server";

import {
  createSupabaseRegionServiceClient,
  createSupabaseServerClient,
} from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { getProfileByUserId } from "@/lib/dal/admin";

// Fetch members for an organization (service role to bypass RLS)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    if (!orgId) {
      return NextResponse.json({ message: "orgId is required" }, { status: 400 });
    }

    const supabase = createSupabaseRegionServiceClient();
    const { data, error } = await supabase
      .from("organization_roles")
      .select("id, role, user:profiles(display_name)")
      .eq("org_id", orgId)
      .is("deleted_at", null);
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (e) {
    return jsonError(e);
  }
}

async function assertCanManage(orgId: string) {
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

// Adds a member to an organization (org_id + profile_id + role)
// Requires caller to have an org role or elevated nav role (dispatcher_admin / regionAdmins)
export async function POST(req: Request) {
  try {
    const { orgId, profileId, role } = await req.json();
    if (!orgId || !profileId || !role) {
      return NextResponse.json(
        { message: "orgId, profileId, and role are required" },
        { status: 400 },
      );
    }

    const { errorResponse } = await assertCanManage(orgId);
    if (errorResponse) return errorResponse;

    // Use service client to bypass RLS insert restriction (only owners can insert via RLS).
    const serviceSupabase = createSupabaseRegionServiceClient();
    const { error } = await serviceSupabase
      .from("organization_roles")
      .insert({ org_id: orgId, user_id: profileId, role });
    if (error) throw error;

    return NextResponse.json({ orgId, profileId, role });
  } catch (e) {
    return jsonError(e);
  }
}

// Update a member's role
export async function PATCH(req: Request) {
  try {
    const { orgId, membershipId, role } = await req.json();
    if (!orgId || !membershipId || !role) {
      return NextResponse.json(
        { message: "orgId, membershipId, and role are required" },
        { status: 400 },
      );
    }

    const { errorResponse } = await assertCanManage(orgId);
    if (errorResponse) return errorResponse;

    const serviceSupabase = createSupabaseRegionServiceClient();
    const { error } = await serviceSupabase
      .from("organization_roles")
      .update({ role })
      .eq("id", membershipId)
      .eq("org_id", orgId);
    if (error) throw error;

    return NextResponse.json({ orgId, membershipId, role });
  } catch (e) {
    return jsonError(e);
  }
}

// Remove a member
export async function DELETE(req: Request) {
  try {
    const { orgId, membershipId } = await req.json();
    if (!orgId || !membershipId) {
      return NextResponse.json(
        { message: "orgId and membershipId are required" },
        { status: 400 },
      );
    }

    const { errorResponse } = await assertCanManage(orgId);
    if (errorResponse) return errorResponse;

    const serviceSupabase = createSupabaseRegionServiceClient();
    const { error } = await serviceSupabase
      .from("organization_roles")
      .delete()
      .eq("id", membershipId)
      .eq("org_id", orgId);
    if (error) throw error;

    return NextResponse.json({ orgId, membershipId });
  } catch (e) {
    return jsonError(e);
  }
}
