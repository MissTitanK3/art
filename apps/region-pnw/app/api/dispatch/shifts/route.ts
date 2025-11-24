import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function GET() {
    try {
        const client = await createSupabaseServerClient();
        const { data, error } = await client
            .from("dispatch_shifts")
            .select(
                "id, pod_id, volunteer_id, starts_at, ends_at, notes, profile:profiles(display_name)",
            )
            .is("deleted_at", null)
            .order("starts_at", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (e: any) {
        return jsonError(e);
    }
}

export async function POST(req: Request) {
    try {
        const client = await createSupabaseServerClient();
        const payload = await req.json();

        // Basic validation could go here

        const { error } = await client.from("dispatch_shifts").upsert(payload);

        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return jsonError(e);
    }
}
