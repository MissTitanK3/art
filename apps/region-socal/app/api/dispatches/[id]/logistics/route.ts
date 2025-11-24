import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { getAuthenticatedProfile } from "@/lib/api/dispatches/utils";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { supabase } = await getAuthenticatedProfile();
        const { data, error } = await supabase
            .from('dispatch_logistics')
            .select('*')
            .eq('dispatch_id', id);
        if (error) throw error;
        return NextResponse.json({ logistics: data || [] });
    } catch (error) {
        return jsonError(error);
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { supabase } = await getAuthenticatedProfile();
        const { items } = await req.json(); // expecting { items: LogisticsItem[] }
        // Delete existing logistics for this dispatch
        const { error: deleteError } = await supabase
            .from('dispatch_logistics')
            .delete()
            .eq('dispatch_id', id);
        if (deleteError) throw deleteError;
        // Insert new items if any
        if (Array.isArray(items) && items.length) {
            const payload = items.map((l: any) => ({
                id: l.id,
                dispatch_id: id,
                category: l.category,
                description: l.description,
                quantity: l.quantity,
                priority: l.priority,
                status: l.status,
                responsible_party: l.responsibleParty ?? null,
                warehouse: l.warehouse ?? null,
                accountability_notes: l.accountabilityNotes ?? null,
            }));
            const { error: insertError } = await supabase.from('dispatch_logistics').insert(payload);
            if (insertError) throw insertError;
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return jsonError(error);
    }
}
