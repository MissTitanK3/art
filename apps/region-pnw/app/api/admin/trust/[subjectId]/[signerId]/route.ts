import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

type PatchBody = Partial<{
  status: string; // 'active' | 'inactive'
  signer_role: string;
  signer_rot: string;
  signed_at: string;
}>;

async function authz() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return false;
  let authorized = !!(userData.user as any)?.role && regionAdmins.includes((userData.user as any).role);
  if (!authorized) {
    const callerProfile = await getProfileByUserId(userData.user.id);
    authorized = !!callerProfile && callerProfile.access_role === 'dispatcher_admin';
  }
  return authorized;
}

function clientFromCookies() {
  const env = ensureSupabaseEnv('server');
  return nextCookies().then((store) =>
    createServerClient(env.url, env.anonKey, {
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
    }),
  );
}

export async function PATCH(req: Request, { params }: { params: Promise<{ subjectId: string; signerId: string }> }) {
  try {
    if (!(await authz())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { subjectId, signerId } = await params;
    const body = (await req.json()) as PatchBody;
    const patch: any = {};
    if (typeof body.status === 'string') patch.status = body.status;
    if (typeof body.signer_role === 'string') patch.signer_role = body.signer_role;
    if (typeof body.signer_rot === 'string') patch.signer_rot = body.signer_rot;
    if (typeof body.signed_at === 'string') patch.signed_at = body.signed_at;
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

    const client = await clientFromCookies();
    const { data, error } = await client
      .from('trust_signatures')
      .update(patch)
      .eq('subject_id', subjectId)
      .eq('signer_id', signerId)
      .select('*')
      .limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const out = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({
      entry: out
        ? {
            subjectId: out.subject_id,
            signerId: out.signer_id,
            signer_role: out.signer_role,
            signer_rot: out.signer_rot,
            signed_at: out.signed_at,
            signed_entry_hash: out.signed_entry_hash,
            status: out.status,
          }
        : null,
    });
  } catch (e: any) {
    return jsonError(e);
  }
}
