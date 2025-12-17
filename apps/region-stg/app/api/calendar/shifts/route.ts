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
  visibility_scope,
  invited_user_ids,
  needed,
  route,
  owners:calendar_owners(owner_type, owner_id),
  pod:pods(
    id,
    name,
    slug,
    area,
    orgs:organization_pods(org_id, organization:organizations(id, name, description))
  ),
  signups:calendar_signups(user_id)
`;

const DEFAULT_VISIBILITY_SCOPE = "org_and_region_masked";

async function resolveUserAndProfileId(supabase: any) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        throw new Error("Unauthorized");
    }
    const userId = userData.user.id;
    const { data: profileRow } = await supabase
        .from("profiles")
        .select("id, user_id")
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .maybeSingle();
    const profileId = profileRow?.id ?? profileRow?.user_id ?? userId;
    return { userId, profileId };
}

function buildOwnerRows(
    resourceId: string,
    options: {
        profileId?: string | null;
        podId?: string | null;
        orgId?: string | null;
        ownerPodIds?: string[];
        ownerOrgIds?: string[];
    },
) {
    const rows: { resource_id: string; owner_type: string; owner_id: string }[] =
        [];
    const podIds = Array.from(
        new Set(
            [
                ...(options.ownerPodIds ?? []),
                options.podId ? String(options.podId) : null,
            ].filter(Boolean) as string[],
        ),
    );
    const orgIds = Array.from(
        new Set(
            [
                ...(options.ownerOrgIds ?? []),
                options.orgId ? String(options.orgId) : null,
            ].filter(Boolean) as string[],
        ),
    );

    if (options.profileId) {
        rows.push({
            resource_id: resourceId,
            owner_type: "user",
            owner_id: String(options.profileId),
        });
    }
    for (const podId of podIds) {
        rows.push({
            resource_id: resourceId,
            owner_type: "pod",
            owner_id: podId,
        });
    }
    for (const orgId of orgIds) {
        rows.push({
            resource_id: resourceId,
            owner_type: "org",
            owner_id: orgId,
        });
    }
    return rows;
}

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { profileId, userId } = await resolveUserAndProfileId(supabase);
        const body = await req.json();
        const {
            id,
            podId,
            start,
            end,
            tz,
            headcount,
            location,
            label,
            dispatchLink,
            notes,
            visibility,
            needed,
            route,
            visibilityScope,
            invitedUserIds,
            ownerProfileId,
            ownerPodIds,
            ownerOrgIds,
            organizationId,
        } = body;

        const payload = {
            id: id ?? crypto.randomUUID(),
            pod_id: podId,
            start,
            end,
            tz,
            headcount,
            location,
            label,
            dispatch_link: dispatchLink,
            notes,
            visibility,
            needed,
            route,
            visibility_scope: visibilityScope ?? DEFAULT_VISIBILITY_SCOPE,
            invited_user_ids: invitedUserIds ?? [],
        };

        const { data, error } = await supabase
            .from("calendar_items")
            .upsert(payload)
            .select(SHIFT_SELECT_FIELDS)
            .maybeSingle();

        if (error) throw error;
        const owners = buildOwnerRows(payload.id, {
            profileId: ownerProfileId ?? profileId ?? userId,
            podId: podId ?? null,
            orgId: organizationId ?? ownerOrgIds?.[0] ?? null,
            ownerPodIds,
            ownerOrgIds,
        });

        if (owners.length > 0) {
            const { error: ownersError } = await supabase
                .from("calendar_owners")
                .upsert(owners, { onConflict: "resource_id,owner_type,owner_id" });
            if (ownersError) throw ownersError;
        }
        if (!data) throw new Error("Missing shift row");

        return NextResponse.json(data);
    } catch (e) {
        return jsonError(e);
    }
}
