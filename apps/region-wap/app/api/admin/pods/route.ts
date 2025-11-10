import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfileByUserId, getPods } from '@/lib/dal/admin';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { regionAdmins } from '@workspace/store/utils/nav';
import { slugify } from '@workspace/store/types/pod.ts';
import { ADMIN_GROUP_ROLES, notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

type PostBody = Partial<{
  name: string;
  area?: string;
  channels?: any[];
}>;

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    // Authorize based on application access_role (profile)
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized =
      !!callerAccessRole &&
      (regionAdmins.includes(callerAccessRole) ||
        callerAccessRole === 'dispatcher_admin' ||
        callerAccessRole === 'dispatcher_verified' ||
        callerAccessRole === 'dispatcher_basic' ||
        callerAccessRole === 'pod_leader' ||
        callerAccessRole === 'trainer');
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json()) as PostBody;
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const payload: any = {
      name,
      slug: slugify(name),
      area: body.area ?? 'Unassigned',
      channels: Array.isArray(body.channels) ? body.channels : [],
      created_by: callerProfile?.id ?? null,
    };

    const client = await createSupabaseServerClient();
    const { data, error } = await client.from('pods').insert(payload).select('id, slug, name, area, channels').limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);

    // If a Pod Leader or Trainer created the pod, register them as a lead on this pod
    try {
      if (callerAccessRole === 'pod_leader' || callerAccessRole === 'trainer') {
        const rosterId = `r-${crypto.randomUUID()}`;
        await client.from('roster_entries').upsert({
          id: rosterId,
          pod_id: row.id,
          profile_id: callerProfile?.id,
          role: 'lead',
          status: 'active',
          joined_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[admin/pods] POST add-creator-as-lead exception:', e);
    }

    // Fire-and-forget: let admins know a pod was created
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({
          roles: ADMIN_GROUP_ROLES,
          channel: 'system',
        });
        if (recipients.length) {
          await notifyUsers({
            title: 'New Pod Created',
            body: `${row?.name ?? 'Unnamed'} · Area: ${row?.area ?? 'Unassigned'}`,
            level: 'success',
            channel: 'system',
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn('[admin/pods] POST notify exception:', e);
      }
    })();
    return NextResponse.json({ pod: row });
  } catch (e: any) {
    return jsonError(e);
  }
}

export const GET = async (_req: Request) => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized =
      !!callerAccessRole &&
      (regionAdmins.includes(callerAccessRole) ||
        callerAccessRole === 'dispatcher_admin' ||
        callerAccessRole === 'dispatcher_verified' ||
        callerAccessRole === 'dispatcher_basic');
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pods = await getPods();
    return NextResponse.json({ pods });
  } catch (e: any) {
    return jsonError(e);
  }
};
