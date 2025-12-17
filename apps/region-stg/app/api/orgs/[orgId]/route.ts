import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseRegionServiceClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const service = createSupabaseRegionServiceClient();
        const { orgId } = await params;
        const body = await req.json();
        const { name, description, norms, visibilityScope } = body;

        // Ensure caller is authenticated and is owner/admin of the org
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const userId = userData.user?.id;
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const serviceProfile = await service
            .from("profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
        if (serviceProfile.error) throw serviceProfile.error;
        const profileId = serviceProfile.data?.id ?? userId;

        const { data: roleRow, error: roleError } = await service
            .from("organization_roles")
            .select("role")
            .eq("org_id", orgId)
            .in("user_id", [userId, profileId])
            .maybeSingle();
        if (roleError) throw roleError;
        const role = roleRow?.role;
        const canEdit = role === "owner" || role === "admin";
        if (!canEdit) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (norms !== undefined) updates.norms = norms;
        if (visibilityScope !== undefined) updates.visibility_scope = visibilityScope;

        const { error } = await service
            .from("organizations")
            .update(updates)
            .eq("id", orgId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e) {
        return jsonError(e);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const { orgId } = await params;
        const { error } = await supabase.rpc("safe_delete_organization", {
            p_id: orgId,
        });
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e) {
        return jsonError(e);
    }
}
