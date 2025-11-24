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

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const body = await req.json();
        const {
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
        } = body;

        const payload = {
            id: id ?? crypto.randomUUID(),
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
            .upsert(payload)
            .select(SHIFT_SELECT_FIELDS)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Missing shift row");

        return NextResponse.json(data);
    } catch (e) {
        return jsonError(e);
    }
}
