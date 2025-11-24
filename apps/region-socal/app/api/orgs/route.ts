import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { REGION_IDENTIFIER } from "@/app/brand_settings";

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
