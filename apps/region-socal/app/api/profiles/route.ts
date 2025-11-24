import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("display_name", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ profiles: data });
    } catch (e) {
        return jsonError(e);
    }
}
