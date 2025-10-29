import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { slugify } from '@workspace/store/types/pod.ts';

type PatchBody = Partial<{
  name: string;
  area: string;
  channels: any[];
}>;

async function authz() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return false;
  const callerProfile = await getProfileByUserId(data.user.id);
  const callerAccessRole = callerProfile?.access_role as any | undefined;
  return !!callerAccessRole && (regionAdmins.includes(callerAccessRole) || callerAccessRole === 'dispatcher_admin');
}

// Use the shared server-side Supabase client that correctly wires Next.js cookies.

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await authz())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const body = (await req.json()) as PatchBody;
    const patch: any = {};
    if (typeof body.name === 'string' && body.name.trim()) {
      patch.name = body.name.trim();
      patch.slug = slugify(patch.name);
    }
    if (typeof body.area === 'string') patch.area = body.area;
    if (Array.isArray(body.channels)) patch.channels = body.channels;
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from('pods')
      .update(patch)
      .eq('id', id)
      .select('id, slug, name, area, channels')
      .limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({ pod: row ?? null });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await authz())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const client = await createSupabaseServerClient();
    const { error } = await client.from('pods').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e);
  }
}
