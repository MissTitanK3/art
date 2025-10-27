import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/providers/supabase/common';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import crypto from 'node:crypto';

type PostBody = Partial<{
  subjectId: string;
  signerId: string;
  signer_role: string;
  signer_rot: string;
  status: string; // 'active' | 'inactive'
  signed_at?: string;
  signed_entry_hash?: string;
}>;

export async function POST(req: Request) {
  try {
    const session = await requireServerSession();
    let authorized = regionAdmins.includes(session.user.role);
    if (!authorized) {
      const callerProfile = await getProfileByUserId(session.user.id);
      authorized = !!callerProfile && callerProfile.access_role === 'dispatcher_admin';
    }
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json()) as PostBody;
    const subjectId = body.subjectId?.trim();
    const signerId = body.signerId?.trim();
    const signer_role = body.signer_role ?? 'pod_leader';
    const signer_rot = body.signer_rot ?? '';
    const status = body.status ?? 'active';
    if (!subjectId || !signerId) return NextResponse.json({ error: 'subjectId and signerId are required' }, { status: 400 });

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

    const row = {
      subject_id: subjectId,
      signer_id: signerId,
      signer_role,
      signer_rot,
      status,
      signed_at: body.signed_at ?? new Date().toISOString(),
      signed_entry_hash: body.signed_entry_hash ?? crypto.randomUUID(),
    } as any;

    const { data, error } = await client
      .from('trust_signatures')
      .upsert(row)
      .select('*')
      .limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const out = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({
      entry: {
        subjectId: out.subject_id,
        signerId: out.signer_id,
        signer_role: out.signer_role,
        signer_rot: out.signer_rot,
        signed_at: out.signed_at,
        signed_entry_hash: out.signed_entry_hash,
        status: out.status,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
