import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { slugify } from '@workspace/store/types/pod.ts';
import { ADMIN_GROUP_ROLES, notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

type PatchBody = Partial<{
  name: string;
  area: string;
  channels: any[];
}>;

async function authz(podId?: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return false;
  const callerProfile = await getProfileByUserId(data.user.id);
  const callerAccessRole = callerProfile?.access_role as any | undefined;
  const isGlobalAdmin = !!callerAccessRole && (
    regionAdmins.includes(callerAccessRole) ||
    callerAccessRole === 'dispatcher_admin' ||
    callerAccessRole === 'dispatcher_verified' ||
    callerAccessRole === 'dispatcher_basic'
  );
  if (isGlobalAdmin) return true;

  if (!podId || !callerProfile?.id) return false;
  try {
    const { data: leadRows, error: leadErr } = await supabase
      .from('roster_entries')
      .select('id')
      .eq('pod_id', podId)
      .eq('profile_id', callerProfile.id)
      .eq('role', 'lead')
      .limit(1);
    if (!leadErr && Array.isArray(leadRows) && leadRows.length > 0) return true;

    const { data: podRow, error: podErr } = await supabase
      .from('pods')
      .select('created_by')
      .eq('id', podId)
      .maybeSingle();
    if (!podErr && podRow && podRow.created_by && String(podRow.created_by) === String(callerProfile.id)) return true;
  } catch {}
  return false;
}

// Use the shared server-side Supabase client that correctly wires Next.js cookies.

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await authz(id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    // Fire-and-forget: notify admins about important changes
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({ roles: ADMIN_GROUP_ROLES, channel: 'system' });
        if (!recipients.length) return;
        const parts: string[] = [];
        if (typeof patch.name === 'string') parts.push(`name → ${row?.name}`);
        if (typeof patch.area === 'string') parts.push(`area → ${row?.area}`);
        if (Array.isArray(patch.channels)) parts.push('channels updated');
        if (parts.length) {
          await notifyUsers({
            title: 'Pod Updated',
            body: `${row?.name ?? id}: ${parts.join(' · ')}`,
            level: 'info',
            channel: 'system',
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn('[admin/pods] PATCH notify exception:', e);
      }
    })();
    return NextResponse.json({ pod: row ?? null });
  } catch (e: any) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await authz(id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const client = await createSupabaseServerClient();
    const { error } = await client.from('pods').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Fire-and-forget: notify admins about deletion
    (async () => {
      try {
        const recipients = await resolveRecipientsByRoles({ roles: ADMIN_GROUP_ROLES, channel: 'system' });
        if (recipients.length) {
          await notifyUsers({
            title: 'Pod Deleted',
            body: `ID: ${id}`,
            level: 'warning',
            channel: 'system',
            link: null,
            recipients,
          });
        }
      } catch (e) {
        console.warn('[admin/pods] DELETE notify exception:', e);
      }
    })();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(e);
  }
}
