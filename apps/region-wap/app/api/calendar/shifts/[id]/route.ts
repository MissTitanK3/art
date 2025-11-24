import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";

const SHIFT_SELECT_FIELDS = `
  id,
  pod_id,
  start,
  end,
  tz,
  headcount,
  location,
  label,
  dispatch_link,
  notes,
  visibility,
  needed,
  route,
  pod:pods(
    id,
    name,
    slug,
    area,
    orgs:organization_pods(org_id, organization:organizations(id, name, description))
  ),
  signups:pod_shift_signups(user_id)
`;

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const { id } = await params;
        const body = await req.json();
        const {
            pod_id,
            start,
            end,
            tz,
            headcount,
            location,
            label,
            dispatch_link,
            notes,
            visibility,
            needed,
        } = body;

        const payload = {
            pod_id,
            start,
            end,
            tz,
            headcount,
            location,
            label,
            dispatch_link,
            notes,
            visibility,
            needed,
        };

        const { data, error } = await supabase
            .from("pod_shifts")
            .update(payload)
            .eq("id", id)
            .select(SHIFT_SELECT_FIELDS)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Missing shift row");

        return NextResponse.json(data);
    } catch (e) {
        return jsonError(e);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const { id } = await params;
        const { error } = await supabase.rpc("safe_delete_pod_shift", {
            p_id: id,
        });
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e) {
        return jsonError(e);
    }
}
