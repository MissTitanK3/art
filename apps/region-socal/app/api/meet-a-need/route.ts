import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

// Create a new Meet‑A‑Need entry and notify everyone (respecting notification prefs)
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    const body = await req.json();
    const category = String(body?.category ?? '').trim();
    const description = String(body?.description ?? '').trim();
    const urgency = body?.urgency ?? null;
    const visibility = body?.visibility ?? null;
    const locationLabel: string | undefined = body?.locationLabel ? String(body.locationLabel) : undefined;
    const contact: string | undefined = body?.contact ? String(body.contact) : undefined;

    if (!category || !description || !urgency || !visibility) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    // Resolve profile.id for created_by
    const uid = userData.user.id;
    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle();
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    const created_by = profileRow?.id ?? null;
    const row = {
      created_by,
      category,
      description,
      urgency,
      visibility,
      location: locationLabel ? { label: locationLabel } : null,
      contact_preference: contact ?? null,
      updated_at: new Date().toISOString(),
    } as const;

    const { data: inserted, error } = await supabase.from('meet_a_need').insert(row).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify everyone on the system channel (respects prefs and muted channels)
    try {
      const recipients = await resolveRecipientsByRoles({ respectPrefs: true, channel: 'system' });
      if (recipients.length) {
        await notifyUsers({
          title: 'New Community Need',
          body: `${inserted.category}${inserted.urgency ? ` · ${inserted.urgency}` : ''}`,
          level: 'info',
          channel: 'system',
          link: '/meet-a-need',
          recipients,
        });
      }
    } catch (e) {
      console.warn('[meet-a-need] notify exception:', e);
    }

    return NextResponse.json({ need: inserted });
  } catch (e: any) {
    return jsonError(e);
  }
}
