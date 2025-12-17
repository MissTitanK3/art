import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfiles, type ProfilesFilter, getProfileByUserId } from '@/lib/dal/admin';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { regionAdmins } from '@workspace/store/utils/nav';

export async function GET(req: Request) {
  try {
    // Authorization: region admins or dispatcher_admin can view profiles
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized =
      !!callerAccessRole && (regionAdmins.includes(callerAccessRole) || callerAccessRole === 'dispatcher_admin');
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);

    const filter: ProfilesFilter = {};
    const access_role = searchParams.get('access_role');
    const verified_by = searchParams.get('verified_by');
    const availability = searchParams.get('availability');
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '50');

    if (access_role) filter.access_role = access_role as any;
    if (verified_by) filter.verified_by = verified_by as any;
    if (availability === 'true' || availability === 'false') {
      filter.availability = availability === 'true';
    }
    if (query) filter.query = query;

    const { data, count } = await getProfiles(filter, page, pageSize);
    return NextResponse.json({ profiles: data, count });
  } catch (e: any) {
    return jsonError(e);
  }
}
