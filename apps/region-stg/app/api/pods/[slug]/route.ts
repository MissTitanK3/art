import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("pods")
            .select("id, slug, name, area, channels")
            .eq("slug", slug)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            console.error(`[GET /api/pods/${slug}] Database error:`, error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Pod not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ pod: data });
    } catch (error: any) {
        console.error("[GET /api/pods/[slug]] Unexpected error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch pod" },
            { status: 500 }
        );
    }
}
