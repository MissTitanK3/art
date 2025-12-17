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
    const field_role = searchParams.get('field_role');
    const id = searchParams.get('id') || searchParams.get('profile_id');

    if (access_role) filter.access_role = access_role as any;
    if (verified_by) filter.verified_by = verified_by as any;
    if (availability === 'true' || availability === 'false') {
      filter.availability = availability === 'true';
    }

    // If a specific id is requested, return that profile (when authorized), bypassing elevatedRoles filter
    if (id) {
      const { data: profiles } = await getProfiles();
      const match = (profiles ?? []).find((p: any) => String(p.id) === String(id));
      return NextResponse.json({ profiles: match ? [match] : [] });
    }

    const { data: profiles } = await getProfiles(filter);

    // Optional: filter by field role (public.profile.field_roles)
    const result =
      field_role && field_role.trim().length > 0
        ? profiles.filter((p: any) => Array.isArray(p?.field_roles) && p.field_roles.includes(field_role))
        : profiles;

    return NextResponse.json({ profiles: result });
  } catch (e: any) {
    return jsonError(e);
  }
}
