import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const client = await createSupabaseServerClient();
        const { error } = await client.rpc("safe_delete_dispatch_shift", {
            p_id: id,
        });
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return jsonError(e);
    }
}
