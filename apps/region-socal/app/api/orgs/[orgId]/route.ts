import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const { orgId } = await params;
        const body = await req.json();
        const { name, description } = body;

        const { error } = await supabase
            .from("organizations")
            .update({ name, description })
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
