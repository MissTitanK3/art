import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId, getPods } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/providers/supabase/common';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import { slugify } from '@workspace/store/types/pod.ts';

type PostBody = Partial<{
  name: string;
  area?: string;
  channels?: any[];
}>;

export async function POST(req: Request) {
  try {
    const session = await requireServerSession();
    const callerRole = session.user.role;

    // Allow region admins directly; otherwise require dispatcher_admin via profile
    let authorized = regionAdmins.includes(callerRole);
    if (!authorized) {
      const callerProfile = await getProfileByUserId(session.user.id);
      authorized = !!callerProfile && callerProfile.access_role === 'dispatcher_admin';
    }
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

    const env = ensureSupabaseEnv('server');
    const store = await nextCookies().catch(() => null as any);
    const client = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          if (!store) return [] as { name: string; value: string }[];
          return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
        },
        setAll(cookies) {
          if (!store) return;
          try {
            cookies.forEach(({ name, value, options }) => {
              store.set(name, value, options as CookieOptions | undefined);
            });
          } catch {}
        },
      },
    });

    const { data, error } = await client
      .from('pods')
      .insert(payload)
      .select('id, slug, name, area, channels')
      .limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({ pod: row });
  } catch (e: any) {
    return jsonError(e);
  }
}

export const GET = async (_req: Request) => {
  try {
    const session = await requireServerSession();
    let authorized = regionAdmins.includes(session.user.role);
    if (!authorized) {
      const callerProfile = await getProfileByUserId(session.user.id);
      authorized = !!callerProfile && (
        callerProfile.access_role === 'dispatcher_admin' ||
        callerProfile.access_role === 'dispatcher_verified'
      );
    }
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pods = await getPods();
    return NextResponse.json({ pods });
  } catch (e: any) {
    return jsonError(e);
  }
};
