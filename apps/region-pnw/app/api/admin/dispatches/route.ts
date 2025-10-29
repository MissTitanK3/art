import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { createClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';

export async function GET() {
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

    try {
      const env = ensureSupabaseEnv('server');
      const serviceKey = env.serviceRoleKey;
      if (serviceKey) {
        // Use service role to bypass RLS after our explicit authorization check
        const adminClient = createClient(env.url, serviceKey);
        const { data, error } = await adminClient
          .from('dispatch_submissions')
          .select('*')
          .order('timestamp', { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        const rows = Array.isArray(data) ? data : [];
        return NextResponse.json({ submissions: rows });
      }
      // If no service role is present, we can't list all dispatches safely
      return NextResponse.json({ error: 'Service role not configured' }, { status: 501 });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message ?? 'Supabase not configured' }, { status: 500 });
    }
  } catch (e: any) {
    return jsonError(e);
  }
}
