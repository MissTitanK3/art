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
        
        // Validate patch payload to prevent arbitrary column updates
        const json = await req.json();
        const allowedFields = [
            "location_label",
            "status", 
            "priority",
            "visibility_radius_km",
            "intended_action_preset",
            "intended_action_notes",
            "flagged"
        ];
        
        const patch: Record<string, any> = {};
        for (const key of allowedFields) {
            if (key in json) {
                patch[key] = json[key];
            }
        }

        if (Object.keys(patch).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

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
            .is('deleted_at', null)
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
