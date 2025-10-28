import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfiles, type ProfilesFilter } from '@/lib/dal/admin';

export async function GET(req: Request) {
  try {
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
    return NextResponse.json({ profiles });
  } catch (e: any) {
    return jsonError(e);
  }
}
