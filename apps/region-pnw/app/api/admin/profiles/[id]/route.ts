import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createClient } from '@supabase/supabase-js';
import { notifyUsers } from '@/lib/server/notify';

type PatchBody = Partial<{
  access_role: string;
  verified_by: string;
  state: string;
  coordination_zone: string;
}>;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    // Determine authorization based on the caller's application role from their profile
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    // Allow region admins directly; also allow dispatcher_admin
    const authorized =
      !!callerAccessRole && (regionAdmins.includes(callerAccessRole) || callerAccessRole === 'dispatcher_admin');
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = (await req.json()) as PatchBody;
    const allowed: PatchBody = {};
    if (typeof body.access_role === 'string') allowed.access_role = body.access_role;
    if (typeof body.verified_by === 'string') allowed.verified_by = body.verified_by;
    if (typeof body.coordination_zone === 'string') allowed.coordination_zone = body.coordination_zone;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Prefer service-role client for admin updates if available to bypass RLS
    let client: any;
    try {
      const env = ensureSupabaseEnv('server');
      if (env.serviceRoleKey) {
        client = createClient(env.url, env.serviceRoleKey);
      } else {
        client = await createSupabaseServerClient();
      }
    } catch {
      client = await createSupabaseServerClient();
    }
    // Load current profile before update
    const { data: beforeRows } = await client
      .from('profiles')
      .select('*')
      .or(`id.eq.${id},user_id.eq.${id}`)
      .limit(1);
    const before = Array.isArray(beforeRows) ? beforeRows[0] : (beforeRows as any);

    // Perform update (support both schema shapes: id or user_id key)
    const { data, error } = await client
      .from('profiles')
      .update(allowed)
      .or(`id.eq.${id},user_id.eq.${id}`)
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : (data as any);

    // Fire-and-forget notifications to the affected user on key changes
    (async () => {
      try {
        if (!row) return;
        const targetUserId: string | undefined = row.user_id || row.id;
        if (!targetUserId) return;
        if (before && allowed.access_role && before.access_role !== row.access_role) {
          await notifyUsers({
            title: 'Your Access Role Changed',
            body: `New role: ${row.access_role}`,
            level: 'info',
            channel: 'system',
            link: '/profile',
            recipients: [targetUserId],
          });
        }
        if (before && allowed.verified_by && before.verified_by !== row.verified_by) {
          await notifyUsers({
            title: 'Verification Status Updated',
            body: `Verified by: ${row.verified_by}`,
            level: 'success',
            channel: 'system',
            link: '/profile',
            recipients: [targetUserId],
          });
        }
      } catch (e) {
        console.warn('[admin/profiles] PATCH notify exception:', e);
      }
    })();

    return NextResponse.json({ profile: row ?? null });
  } catch (e: any) {
    return jsonError(e);
  }
}
