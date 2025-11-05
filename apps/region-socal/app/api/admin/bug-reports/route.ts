import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    const callerProfile = await getProfileByUserId(userData.user.id);
    const role = callerProfile?.access_role as any | undefined;
    const authorized = !!role && (regionAdmins.includes(role) || role === 'dispatcher_admin');
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const area = searchParams.get('area');

    let query = supabase.from('bug_reports').select('id, created_at, created_by, title, area, status, priority');
    if (status) query = query.eq('status', status);
    if (area) query = query.eq('area', area);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ reports: Array.isArray(data) ? data : [] });
  } catch (e: any) {
    return jsonError(e);
  }
}

