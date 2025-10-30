import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfiles, type ProfilesFilter, getProfileByUserId } from '@/lib/dal/admin';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { podAdmins, elevatedRoles } from '@workspace/store/utils/nav';

export async function GET(req: Request) {
  try {
    // Authorization: pod admins (dispatcher_basic/verified/admin + region/national admins)
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized = !!callerAccessRole && podAdmins.includes(callerAccessRole);
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);

    const filter: ProfilesFilter = {};
    const access_role = searchParams.get('access_role');
    const verified_by = searchParams.get('verified_by');
    const availability = searchParams.get('availability');

    if (access_role) filter.access_role = access_role as any;
    if (verified_by) filter.verified_by = verified_by as any;
    if (availability === 'true' || availability === 'false') {
      filter.availability = availability === 'true';
    }

    const profiles = await getProfiles(filter);
    // Filter to pod_leader and higher (elevatedRoles)
    const allowed = new Set(elevatedRoles);
    const scoped = profiles.filter((p) => p?.access_role && allowed.has(p.access_role as any));
    return NextResponse.json({ profiles: scoped });
  } catch (e: any) {
    return jsonError(e);
  }
}
