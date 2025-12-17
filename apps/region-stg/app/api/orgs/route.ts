import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { REGION_IDENTIFIER } from "@/app/brand_settings";

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        const [podsRes, orgRolesRes, orgPodsRes, orgsRes] = await Promise.all([
            supabase
                .from("pods")
                .select("id, name, slug, area")
                .eq("region_id", REGION_IDENTIFIER)
                .is("deleted_at", null),
            userId
                ? supabase
                    .from("organization_roles")
                    .select("role, org_id, organization:organizations(id, name, description)")
                    .eq("user_id", userId)
                    .is("deleted_at", null)
                : { data: [] },
            supabase
                .from("organization_pods")
                .select("org_id, pod_id, organization:organizations(id, name, description), pod:pods(id, name, slug, area)")
                .eq("organization.region_id", REGION_IDENTIFIER)
                .is("deleted_at", null)
                .is("organization.deleted_at", null)
                .is("pod.deleted_at", null),
            supabase
                .from("organizations")
                .select("id, name, description, visibility_scope")
                .eq("region_id", REGION_IDENTIFIER)
                .is("deleted_at", null),
        ]);

        return NextResponse.json({
            pods: podsRes.data ?? [],
            orgRoles: orgRolesRes.data ?? [],
            orgPods: orgPodsRes.data ?? [],
            organizations: orgsRes.data ?? [],
        });
    } catch (e) {
        return jsonError(e);
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const body = await req.json();
        const { name, description } = body;
        const newId = crypto.randomUUID();

        const { error } = await supabase.from("organizations").insert({
            id: newId,
            region_id: REGION_IDENTIFIER,
            name,
            description,
        });

        if (error) throw error;

        // Assign owner role if we have a profile
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
            const { data: profileRow } = await supabase
                .from("profiles")
                .select("id, user_id")
                .or(`user_id.eq.${userData.user.id},id.eq.${userData.user.id}`)
                .maybeSingle();

            const profileId = profileRow?.id ?? profileRow?.user_id ?? userData.user.id;

            const { error: roleError } = await supabase
                .from("organization_roles")
                .insert({
                    org_id: newId,
                    user_id: profileId,
                    role: "owner",
                });

            if (roleError) {
                console.error("Failed to assign owner role", roleError);
            }
        }

        return NextResponse.json({
            id: newId,
            name,
            description,
            role: "owner",
        });
    } catch (e) {
        return jsonError(e);
    }
}
