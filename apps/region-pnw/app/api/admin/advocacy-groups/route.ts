import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins, podAdmins } from '@workspace/store/utils/nav';
import { createClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { ADMIN_GROUP_ROLES, notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    // Read access for dispatchers and admins (matches RLS SELECT)
    const authorized = !!callerAccessRole && (podAdmins as any[]).includes(callerAccessRole);
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(req.url);
    const onlyActive = url.searchParams.get('active');

    const env = ensureSupabaseEnv('server');
    const serviceKey = env.serviceRoleKey;
    if (!serviceKey) return NextResponse.json({ error: 'Service role not configured' }, { status: 501 });
    const adminClient = createClient(env.url, serviceKey);
    let q = adminClient.from('advocacy_groups').select('*').order('name');
    if (onlyActive === 'true') q = q.eq('active_status', true);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = Array.isArray(data) ? data : [];
    return NextResponse.json({ groups: rows });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized = !!callerAccessRole && regionAdmins.includes(callerAccessRole);
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const payload = await req.json();
    const row = {
      id: payload?.id ?? undefined,
      name: String(payload?.name ?? '').trim() || undefined,
      type: payload?.type ?? null,
      jurisdiction: payload?.jurisdiction ?? null,
      contact_emails: Array.isArray(payload?.contact_emails) ? payload.contact_emails : null,
      contact_signal: payload?.contact_signal ?? null,
      preferred_format: payload?.preferred_format ?? null,
      active_status: typeof payload?.active_status === 'boolean' ? payload.active_status : true,
      notes: payload?.notes ?? null,
      updated_at: new Date().toISOString(),
    } as const;

    if (!row.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const env = ensureSupabaseEnv('server');
    const serviceKey = env.serviceRoleKey;
    if (!serviceKey) return NextResponse.json({ error: 'Service role not configured' }, { status: 501 });
    const adminClient = createClient(env.url, serviceKey);
    const { data, error } = await adminClient.from('advocacy_groups').upsert(row).select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const saved = Array.isArray(data) ? data[0] : data;
    // Fire-and-forget: notify admins about creation/upsert
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({ roles: ADMIN_GROUP_ROLES, channel: 'system' });
        if (recipients.length) {
          await notifyUsers({
            title: 'Advocacy Group Saved',
            body: `${saved?.name ?? 'Untitled'} · Active: ${saved?.active_status ? 'true' : 'false'}`,
            level: 'success',
            channel: 'system',
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn('[admin/advocacy-groups] POST notify exception:', e);
      }
    })();
    return NextResponse.json({ group: saved });
  } catch (e: any) {
    return jsonError(e);
  }
}
