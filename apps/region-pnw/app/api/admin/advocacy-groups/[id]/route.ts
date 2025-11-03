import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { createClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';

async function authorize() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return { ok: false as const, status: 401 };
  const callerProfile = await getProfileByUserId(userData.user.id);
  const callerAccessRole = callerProfile?.access_role as any | undefined;
  const authorized = !!callerAccessRole && regionAdmins.includes(callerAccessRole);
  if (!authorized) return { ok: false as const, status: 403 };
  return { ok: true as const };
}

function adminClient() {
  const env = ensureSupabaseEnv('server');
  const serviceKey = env.serviceRoleKey;
  if (!serviceKey) throw new Error('Service role not configured');
  return createClient(env.url, serviceKey);
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize();
    if (!auth.ok) return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });

    const { id } = await params;
    const body = await _req.json().catch(() => ({}));
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const key of [
      'name',
      'type',
      'jurisdiction',
      'contact_emails',
      'contact_signal',
      'preferred_format',
      'active_status',
      'notes',
    ]) {
      if (key in body) patch[key] = body[key];
    }

    const client = adminClient();
    const { data, error } = await client
      .from('advocacy_groups')
      .update(patch)
      .eq('id', id)
      .select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const updated = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ group: updated });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize();
    if (!auth.ok) return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
    const { id } = await params;
    const client = adminClient();
    const { error } = await client.from('advocacy_groups').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e);
  }
}
