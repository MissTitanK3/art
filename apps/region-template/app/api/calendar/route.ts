import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseRegionServiceClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

const SHIFT_SELECT_FIELDS = `
  id,
  pod_id,
  start,
  end,
  tz,
  headcount,
  location,
  label,
  dispatch_link,
  notes,
  visibility,
  visibility_scope,
  invited_user_ids,
  needed,
  route,
  owners:calendar_owners(owner_type, owner_id),
  pod:pods(
    id,
    name,
    slug,
    area,
    orgs:organization_pods(org_id, organization:organizations(id, name, description))
  ),
  signups:calendar_signups(user_id)
`;

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = userData.user?.id;

        // Resolve profile id
        let profileId: string | null = null;
        if (userId) {
            const { data: profileRow } = await supabase
                .from("profiles")
                .select("id, user_id")
                .or(`user_id.eq.${userId},id.eq.${userId}`)
                .maybeSingle();
            profileId =
                profileRow?.id ?? profileRow?.user_id ?? userData.user?.id ?? null;
        }

        const shiftsPromise = supabase
            .from("calendar_items")
            .select(SHIFT_SELECT_FIELDS)
            .is("deleted_at", null)
            .order("start", { ascending: true });

        const podsPromise = supabase
            .from("pods")
            .select("id, name, slug, area")
            .is("deleted_at", null)
            .order("name", { ascending: true });

        const rosterPromise = profileId
            ? supabase
                .from("roster_entries")
                .select("pod_id")
                .eq("profile_id", profileId)
                .is("deleted_at", null)
            : Promise.resolve({ data: null });

        // Use service client for org queries to bypass RLS issues
        // We'll filter to user's orgs in application code for security
        const supabaseService = await createSupabaseRegionServiceClient();

        const orgRolesPromise = profileId
            ? supabaseService
                .from("organization_roles")
                .select(
                    "org_id, role, organization:organizations(id, name, description)"
                )
                .eq("user_id", profileId)
                .is("deleted_at", null)
                .is("organization.deleted_at", null)
            : Promise.resolve({ data: null });

        const orgPodsPromise = supabaseService
            .from("organization_pods")
            .select(
                "org_id, pod_id, organization:organizations(id, name, description), pod:pods(id, name, slug)"
            )
            .is("deleted_at", null)
            .is("organization.deleted_at", null)
            .is("pod.deleted_at", null);

        const [shiftsRes, podsRes, rosterRes, orgRolesRes, orgPodsRes] =
            await Promise.all([
                shiftsPromise,
                podsPromise,
                rosterPromise,
                orgRolesPromise,
                orgPodsPromise,
            ]);

        if (shiftsRes.error) throw shiftsRes.error;
        if (podsRes.error) throw podsRes.error;
        if ("error" in orgRolesRes && orgRolesRes.error) throw orgRolesRes.error;
        if ("error" in orgPodsRes && orgPodsRes.error) throw orgPodsRes.error;

        return NextResponse.json({
            shifts: shiftsRes.data,
            pods: podsRes.data,
            roster: rosterRes.data,
            orgRoles: orgRolesRes.data,
            orgPods: orgPodsRes.data,
            userId,
            profileId,
        });
    } catch (e) {
        return jsonError(e);
    }
}
