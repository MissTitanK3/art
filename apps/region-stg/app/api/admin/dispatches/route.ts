import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { createClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '50');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const env = ensureSupabaseEnv('server');
      const serviceKey = env.serviceRoleKey;
      if (serviceKey) {
        // Use service role to bypass RLS after our explicit authorization check
        const adminClient = createClient(env.url, serviceKey);
        const { data, error, count } = await adminClient
          .from('dispatch_submissions')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)
          .order('timestamp', { ascending: false })
          .range(from, to);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        const rows = Array.isArray(data) ? data : [];
        return NextResponse.json({ submissions: rows, count: count ?? 0 });
      }
    } catch (e: any) {
      // ignore and fall back to session-scoped client
    }

    // Fallback: use regional session client (RLS may limit rows)
    const { data, error, count } = await supabase
      .from('dispatch_submissions')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('timestamp', { ascending: false })
      .range(from, to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = Array.isArray(data) ? data : [];
    return NextResponse.json({ submissions: rows, count: count ?? 0 });
  } catch (e: any) {
    return jsonError(e);
  }
}
