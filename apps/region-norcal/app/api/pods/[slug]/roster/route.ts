import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createSupabaseServerClient();

        // First, get the pod ID from the slug
        const { data: pod, error: podError } = await supabase
            .from("pods")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (podError) {
            console.error(`[GET /api/pods/${slug}/roster] Pod fetch error:`, podError);
            return NextResponse.json(
                { error: podError.message },
                { status: 500 }
            );
        }

        if (!pod) {
            return NextResponse.json(
                { error: "Pod not found" },
                { status: 404 }
            );
        }

        // Fetch roster entries with profile data
        const { data, error } = await supabase
            .from("roster_entries")
            .select("*, profile:profiles(*)")
            .eq("pod_id", pod.id)
            .order("joined_at", { ascending: true });

        if (error) {
            console.error(`[GET /api/pods/${slug}/roster] Database error:`, error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ roster: data || [] });
    } catch (error: any) {
        console.error("[GET /api/pods/[slug]/roster] Unexpected error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch roster" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createSupabaseServerClient();

        // First, get the pod ID from the slug
        const { data: pod, error: podError } = await supabase
            .from("pods")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (podError) {
            console.error(`[POST /api/pods/${slug}/roster] Pod fetch error:`, podError);
            return NextResponse.json(
                { error: podError.message },
                { status: 500 }
            );
        }

        if (!pod) {
            return NextResponse.json(
                { error: "Pod not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { entry } = body;

        if (!entry) {
            return NextResponse.json(
                { error: "Roster entry is required" },
                { status: 400 }
            );
        }

        // Prepare payload for database
        const payload = {
            id: entry.id,
            pod_id: pod.id,
            profile_id: entry.profile?.id ?? entry.profile_id,
            role: entry.role,
            status: entry.status,
            langs: entry.langs || [],
            skills: entry.skills || [],
            certs: entry.certs || [],
            notes: entry.notes,
            handle: entry.handle,
            joined_at: entry.joinedAt,
            last_shift_at: entry.lastShiftAt,
            signal_handle: entry.signal_handle,
        };

        const { data, error } = await supabase
            .from("roster_entries")
            .upsert(payload)
            .select("*, profile:profiles(*)")
            .single();

        if (error) {
            console.error(`[POST /api/pods/${slug}/roster] Database error:`, error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ entry: data });
    } catch (error: any) {
        console.error("[POST /api/pods/[slug]/roster] Unexpected error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to save roster entry" },
            { status: 500 }
        );
    }
}
