import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const searchParams = request.nextUrl.searchParams;

        // Build query with optional filters
        let query = supabase
            .from("pods")
            .select("id, slug, name, area, channels")
            .is("deleted_at", null)
            .order("name", { ascending: true });

        // Apply filters from query params
        const area = searchParams.get("area");
        const channel = searchParams.get("channel");
        const q = searchParams.get("q");

        if (area && area !== "all") {
            query = query.eq("area", area);
        }

        if (channel && channel !== "all") {
            // Filter by channel type in JSONB array
            query = query.contains("channels", [{ type: channel }]);
        }

        if (q && q.trim().length > 0) {
            const like = `%${q}%`;
            query = query.or(
                `name.ilike.${like},slug.ilike.${like},area.ilike.${like}`
            );
        }

        const { data, error } = await query;

        if (error) {
            console.error("[GET /api/pods] Database error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ pods: data || [] });
    } catch (error: any) {
        console.error("[GET /api/pods] Unexpected error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch pods" },
            { status: 500 }
        );
    }
}
