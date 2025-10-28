import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createClient } from '@supabase/supabase-js';

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
    const callerRole = (userData.user as any)?.role as string | undefined;

    // Allow region admins directly; otherwise require dispatcher_admin via profile
    let authorized = !!callerRole && regionAdmins.includes(callerRole as any);
    if (!authorized) {
      const callerProfile = await getProfileByUserId(userData.user.id);
      authorized = !!callerProfile && callerProfile.access_role === 'dispatcher_admin';
    }
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
    console.log('Updating profile id:', id, 'with:', allowed);
    console.log('Caller user id:', userData.user.id);

    // Support both schema shapes: some regions use profiles.id === auth user id,
    // others store auth id in profiles.user_id with a separate profiles.id.
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
    return NextResponse.json({ profile: row ?? null });
  } catch (e: any) {
    return jsonError(e);
  }
}
