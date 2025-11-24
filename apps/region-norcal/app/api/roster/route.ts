import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const podId = searchParams.get("pod_id");

        const supabase = await createSupabaseServerClient();
        let query = supabase
            .from("roster_entries")
            .select("*, profile:profiles(*)")
            .is("deleted_at", null)
            .order("joined_at", { ascending: true });

        if (podId) {
            query = query.eq("pod_id", podId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ roster: data });
    } catch (e) {
        return jsonError(e);
    }
}
