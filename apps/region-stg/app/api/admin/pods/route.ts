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
      id: crypto.randomUUID(),
      name,
      slug: slugify(name),
      area: body.area ?? 'Unassigned',
      channels: Array.isArray(body.channels) ? body.channels : [],
    };
    if (callerProfile?.id) {
      payload.created_by = callerProfile.id;
    }

    const client = await createSupabaseServerClient();
    let { data, error } = await client
      .from('pods')
      .insert(payload)
      .select('id, slug, name, area, channels')
      .maybeSingle();

    // Handle slug collision
    if (error && error.code === '23505') {
      console.warn('[admin/pods] Slug collision, retrying with suffix');
      payload.slug = `${slugify(name)}-${Math.floor(Math.random() * 1000)}`;
      const retry = await client.from('pods').insert(payload).select('id, slug, name, area, channels').maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[admin/pods] Create failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const row = data;
    if (!row) {
      throw new Error('Failed to retrieve created pod');
    }

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

export const GET = async (req: Request) => {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '50');

    const { data, count } = await getPods(page, pageSize);
    return NextResponse.json({ pods: data, count });
  } catch (e: any) {
    return jsonError(e);
  }
};
