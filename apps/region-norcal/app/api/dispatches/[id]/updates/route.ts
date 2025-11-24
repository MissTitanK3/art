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
            .from('dispatch_updates')
            .select('*')
            .eq('dispatch_id', id)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return NextResponse.json({ updates: data || [] });
    } catch (error) {
        return jsonError(error);
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { supabase } = await getAuthenticatedProfile();
        const update = await req.json();
        const payload = { ...update, dispatch_id: id };
        const { error } = await supabase.from('dispatch_updates').insert(payload);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return jsonError(error);
    }
}
