import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfileByUserId, getPods } from '@/lib/dal/admin';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { regionAdmins } from '@workspace/store/utils/nav';
import { slugify } from '@workspace/store/types/pod.ts';

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
      !!callerAccessRole && (regionAdmins.includes(callerAccessRole) || callerAccessRole === 'dispatcher_admin');
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
    };

    const client = await createSupabaseServerClient();

    const { data, error } = await client.from('pods').insert(payload).select('id, slug, name, area, channels').limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
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
        callerAccessRole === 'dispatcher_verified');
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pods = await getPods();
    return NextResponse.json({ pods });
  } catch (e: any) {
    return jsonError(e);
  }
};
