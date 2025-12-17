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
            .is("deleted_at", null)
            .maybeSingle();

        if (podError) {
            console.error(`[GET /api/pods/${slug}/shifts] Pod fetch error:`, podError);
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

        // Fetch shifts for this pod
        const { data, error } = await supabase
            .from("pod_shifts")
            .select("*")
            .eq("pod_id", pod.id)
            .is("deleted_at", null)
            .order("start", { ascending: true });

        if (error) {
            console.error(`[GET /api/pods/${slug}/shifts] Database error:`, error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ shifts: data || [] });
    } catch (error: any) {
        console.error("[GET /api/pods/[slug]/shifts] Unexpected error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch shifts" },
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
            console.error(`[POST /api/pods/${slug}/shifts] Pod fetch error:`, podError);
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
        const { shift } = body;

        if (!shift) {
            return NextResponse.json(
                { error: "Shift data is required" },
                { status: 400 }
            );
        }

        // Prepare payload for database
        const payload = {
            id: shift.id,
            pod_id: pod.id,
            start: shift.start,
            end: shift.end,
            tz: shift.tz,
            headcount: shift.headcount || 1,
            location: shift.location,
            label: shift.label,
            dispatch_link: shift.dispatchLink,
            notes: shift.notes,
        };

        const { data, error } = await supabase
            .from("pod_shifts")
            .upsert(payload)
            .select("*")
            .single();

        if (error) {
            console.error(`[POST /api/pods/${slug}/shifts] Database error:`, error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ shift: data });
    } catch (error: any) {
        console.error("[POST /api/pods/[slug]/shifts] Unexpected error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to save shift" },
            { status: 500 }
        );
    }
}
