import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile } from "@/lib/api/dispatches/utils";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { supabase } = await getAuthenticatedProfile();
        const patch: Partial<any> = await req.json();
        const { error } = await supabase
            .from("dispatch_submissions")
            .update(patch)
            .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return jsonError(error);
    }
}
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { supabase } = await getAuthenticatedProfile();
        // Fetch submission
        const { data: submission, error: subError } = await supabase
            .from('dispatch_submissions')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (subError) throw subError;
        if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        // Fetch updates
        const { data: updates, error: updError } = await supabase
            .from('dispatch_updates')
            .select('*')
            .eq('dispatch_id', id)
            .order('created_at', { ascending: true });
        if (updError) throw updError;
        // Fetch logistics
        const { data: logistics, error: logError } = await supabase
            .from('dispatch_logistics')
            .select('*')
            .eq('dispatch_id', id)
            .order('updated_at', { ascending: true });
        if (logError) throw logError;
        return NextResponse.json({ submission, updates, logistics });
    } catch (error) {
        return jsonError(error);
    }
}
