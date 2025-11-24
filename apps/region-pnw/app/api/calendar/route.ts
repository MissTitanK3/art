import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

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
            .from("pod_shifts")
            .select(
                `
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
        needed,
        route,
        pod:pods(
          id,
          name,
          slug,
          area,
          orgs:organization_pods(org_id, organization:organizations(id, name, description))
        ),
        signups:pod_shift_signups(user_id)
      `
            )
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

        const orgRolesPromise = profileId
            ? supabase
                .from("organization_roles")
                .select(
                    "org_id, role, organization:organizations(id, name, description)"
                )
                .eq("user_id", profileId)
                .is("deleted_at", null)
                .is("organization.deleted_at", null)
            : Promise.resolve({ data: null });

        const orgPodsPromise = supabase
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
