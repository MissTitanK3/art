import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

// Upsert an academy class and notify on the 'academy' channel
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    const body = await req.json();
    const id = String(body?.id ?? crypto.randomUUID());
    const row = {
      id,
      pathway_id: body?.pathway_id ?? null,
      pathway_label: body?.pathway_label ?? null,
      track_label: body?.track_label ?? null,
      variant: body?.variant ?? null,
      title: body?.title ?? null,
      description: body?.description ?? null,
      modality: body?.modality ?? null,
      instructor_type: body?.instructor_type ?? null,
      duration_hours: body?.duration_hours ?? null,
      capacity: body?.capacity ?? null,
      start_date: body?.start_date ?? null,
      start_time: body?.start_time ?? null,
      location: body?.location ?? null,
      meeting_url: body?.meeting_url ?? null,
      notes: body?.notes ?? null,
      instructor_name: body?.instructor_name ?? null,
      sessions_scheduled: body?.sessions_scheduled ?? null,
      next_session: body?.next_session ?? null,
      status: body?.status ?? 'scheduled',
      updated_at: new Date().toISOString(),
    } as const;

    const { error } = await supabase.from('academy_classes').upsert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Preference-aware notify on 'academy'
    try {
      const recipients = await resolveRecipientsByRoles({ respectPrefs: true, channel: 'academy' });
      if (recipients.length) {
        await notifyUsers({
          title: 'New Academy Class',
          body: row.title ?? undefined,
          level: 'success',
          channel: 'academy',
          link: `/academy/class/${id}`,
          recipients,
        });
      }
    } catch (e) {
      console.warn('[academy/classes] notify exception:', e);
    }

    return NextResponse.json({ id });
  } catch (e: any) {
    return jsonError(e);
  }
}
