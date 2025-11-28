import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createSupabaseServerClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("Unauthorized");

        const userId = userData.user.id;

        // Resolve profile id
        const { data: profileRow } = await supabase
            .from("profiles")
            .select("id, user_id")
            .or(`user_id.eq.${userId},id.eq.${userId}`)
            .maybeSingle();

        const signupId = profileRow?.id ?? profileRow?.user_id ?? userId;

        const { error } = await supabase
            .from("calendar_signups")
            .upsert({
                id: crypto.randomUUID(),
                item_id: id,
                user_id: signupId,
            });

        if (error) throw error;

        return NextResponse.json({ success: true, signupId });
    } catch (e) {
        return jsonError(e);
    }
}
