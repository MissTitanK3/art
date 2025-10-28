import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const session = await requireServerSession();
    let authorized = regionAdmins.includes(session.user.role);
    if (!authorized) {
      const callerProfile = await getProfileByUserId(session.user.id);
      authorized =
        !!callerProfile &&
        (callerProfile.access_role === 'dispatcher_admin' || callerProfile.access_role === 'dispatcher_verified');
    }
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const env = ensureSupabaseEnv('server');
    const serviceKey = env.serviceRoleKey;
    if (!serviceKey) {
      return NextResponse.json({ error: 'Server not configured with service role key' }, { status: 500 });
    }

    // Use service role to bypass RLS after our explicit authorization check
    const adminClient = createClient(env.url, serviceKey);
    const { data, error } = await adminClient
      .from('dispatch_submissions')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = Array.isArray(data) ? data : [];
    return NextResponse.json({ submissions: rows });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
