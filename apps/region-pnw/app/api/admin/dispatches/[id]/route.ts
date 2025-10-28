import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/providers/supabase/common';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

type PatchBody = Partial<{
  flagged: boolean;
  status: string;
}>;

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

    const { id } = await params;
    const { data, error } = await client
      .from('dispatch_submissions')
      .update(updates)
      .eq('id', id)
      .select('*')
      .limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({ submission: row ?? null });
  } catch (e: any) {
    return jsonError(e);
  }
}
