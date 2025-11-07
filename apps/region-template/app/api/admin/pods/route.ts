import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import { slugify } from '@workspace/store/types/pod.ts';

type PostBody = Partial<{
  name: string;
  area?: string;
  channels?: any[];
}>;

function isDemoProvider() {
  const p = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? process.env.AUTH_PROVIDER ?? 'demo';
  return p === 'demo';
}

export async function POST(req: Request) {
  try {
    const session = await requireServerSession();
    const callerRole = session.user.role;
    const callerProfile = await getProfileByUserId(session.user.id);

    let authorized = regionAdmins.includes(callerRole);
    if (!authorized) {
      const access = callerProfile?.access_role;
      authorized = !!access && (
        access === 'dispatcher_admin' ||
        access === 'dispatcher_verified' ||
        access === 'dispatcher_basic' ||
        access === 'pod_leader' ||
        access === 'trainer'
      );
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
      created_by: callerProfile?.id ?? null,
    };

    if (isDemoProvider()) {
      return NextResponse.json({ pod: { id: 'demo', ...payload }, demo: true });
    }

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
          } catch { /* no-op */ }
        },
      },
    });

    const { data, error } = await client.from('pods').insert(payload).select('id, slug, name, area, channels').limit(1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    try {
      if (callerProfile?.access_role === 'pod_leader' || callerProfile?.access_role === 'trainer') {
        const rosterId = `r-${crypto.randomUUID()}`;
        await client.from('roster_entries').upsert({
          id: rosterId,
          pod_id: row.id,
          profile_id: callerProfile.id,
          role: 'lead',
          status: 'active',
          joined_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[region-template admin/pods] POST add-creator-as-lead exception:', e);
    }
    return NextResponse.json({ pod: row });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireServerSession();
    if (isDemoProvider()) {
      return NextResponse.json({ pods: [], demo: true });
    }
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
          } catch { /* no-op */ }
        },
      },
    });
    const { data, error } = await client
      .from('pods')
      .select('id, slug, name, area, channels')
      .order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pods: Array.isArray(data) ? data : [] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
