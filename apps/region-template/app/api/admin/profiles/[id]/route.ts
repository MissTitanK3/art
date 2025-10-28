import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

type PatchBody = Partial<{
  access_role: string;
  verified_by: string;
  state: string;
  coordination_zone: string;
}>;

function isDemoProvider() {
  const p = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? process.env.AUTH_PROVIDER ?? 'demo';
  return p === 'demo';
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = (await req.json()) as PatchBody;
    const allowed: PatchBody = {};
    if (typeof body.access_role === 'string') allowed.access_role = body.access_role;
    if (typeof body.verified_by === 'string') allowed.verified_by = body.verified_by;
    if (typeof body.coordination_zone === 'string') allowed.coordination_zone = body.coordination_zone;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Demo fallback: no-op success
    if (isDemoProvider()) {
      return NextResponse.json({ profile: null, ok: true, demo: true });
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
          } catch {}
        },
      },
    });

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
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
