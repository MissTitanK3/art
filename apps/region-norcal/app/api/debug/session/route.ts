import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: supaUser }, { data: supaSession }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getSession(),
    ]);
    const provider = 'supabase';
    const userId = supaUser?.user?.id ?? null;
    const role = ((supaUser?.user as any)?.user_metadata?.role ?? (supaUser?.user as any)?.role ?? null) as any;

    let profile: any = null;
    if (userId) {
      try {
        const p = await getProfileByUserId(userId);
        if (p) {
          // redact potentially large fields
          const { id, user_id, access_role, verified_by, state, inserted_at } = p as any;
          profile = { id, user_id, access_role, verified_by, state, inserted_at };
        }
      } catch (e) {
        profile = { error: String(e) };
      }
    }

    return NextResponse.json({
      ok: true,
      provider,
      userId,
      role,
      roleIsRegionAdmin: role ? regionAdmins.includes(role as any) : false,
      profile,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
