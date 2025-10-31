import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return { supabase, userId: null as string | null };
  const callerProfile = await getProfileByUserId(userData.user.id);
  const role = callerProfile?.access_role as any | undefined;
  const authorized = !!role && (regionAdmins.includes(role) || role === 'dispatcher_admin');
  return { supabase, userId: userData.user.id as string, authorized };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, authorized } = await requireAdmin();
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { data, error } = await supabase
      .from('bug_reports')
      .select('id, created_at, created_by, title, area, steps, expected, actual, status, priority, metadata')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ report: data });
  } catch (e: any) {
    return jsonError(e, 500);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, authorized } = await requireAdmin();
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const update: Record<string, any> = {};
    for (const key of ['title', 'area', 'steps', 'expected', 'actual', 'status', 'priority', 'metadata']) {
      if (key in body) update[key] = body[key];
    }
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No changes' }, { status: 400 });
    const { data, error } = await supabase
      .from('bug_reports')
      .update(update)
      .eq('id', id)
      .select('id')
      .single();
    if (error) throw error;
    return NextResponse.json({ id: data?.id });
  } catch (e: any) {
    return jsonError(e, 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, authorized } = await requireAdmin();
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { error } = await supabase.from('bug_reports').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e, 500);
  }
}

