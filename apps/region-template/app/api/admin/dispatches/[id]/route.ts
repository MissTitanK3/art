import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

type PatchBody = Partial<{
  flagged: boolean;
  status: string;
}>;

function isDemoProvider() {
  const p = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? process.env.AUTH_PROVIDER ?? 'demo';
  return p === 'demo';
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireServerSession();
    let authorized = regionAdmins.includes(session.user.role);
    if (!authorized) {
      const callerProfile = await getProfileByUserId(session.user.id);
      authorized = !!callerProfile && callerProfile.access_role === 'dispatcher_admin';
    }
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json()) as PatchBody;
    const updates: any = {};
    if (typeof body.flagged === 'boolean') updates.flagged = body.flagged;
    if (typeof body.status === 'string') updates.status = body.status;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

    const { id } = await params;
    if (isDemoProvider()) return NextResponse.json({ submission: { id, ...updates }, demo: true });

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

    const { data, error } = await client.from('dispatch_submissions').update(updates).eq('id', id).select('*').limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({ submission: row ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
