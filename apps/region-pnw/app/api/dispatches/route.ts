import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

// Create a new dispatch submission and notify everyone on the dispatch channel
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    const payload = await req.json();
    // Minimal shape validation; we trust the client form to provide the full draft
    const submission = {
      id: String(payload?.id ?? crypto.randomUUID()),
      type: payload?.type ?? null,
      location: payload?.location ?? null,
      timestamp: payload?.timestamp ?? new Date().toISOString(),
      date_of_event: payload?.date_of_event ?? null,
      required_roles: Array.isArray(payload?.required_roles) ? payload.required_roles : null,
      encrypted_payload: payload?.encrypted_payload ?? null,
      auto_delete_after: payload?.auto_delete_after ?? null,
      integrity_hash: payload?.integrity_hash ?? null,
      submitted_by: payload?.submitted_by ?? null,
      source: payload?.source ?? null,
      visibility_radius_km: payload?.visibility_radius_km ?? null,
      status: payload?.status ?? 'open',
      assigned_volunteers: Array.isArray(payload?.assigned_volunteers) ? payload.assigned_volunteers : [],
      required_roles_by_type: payload?.required_roles_by_type ?? null,
      location_label: payload?.location_label ?? null,
      point_of_contact: payload?.point_of_contact ?? null,
      state: payload?.state ?? null,
      intended_action_preset: payload?.intended_action_preset ?? null,
      intended_action_notes: payload?.intended_action_notes ?? null,
      intended_actions: Array.isArray(payload?.intended_actions) ? payload.intended_actions : null,
      intended_actions_custom: payload?.intended_actions_custom ?? null,
      signal_link: payload?.signal_link ?? null,
      training: Boolean(payload?.training ?? false),
      flagged: Boolean(payload?.flagged ?? false),
      updated_at: new Date().toISOString(),
    } as const;

    const { data, error } = await supabase.from('dispatch_submissions').insert(submission).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify all users (respecting prefs) on dispatch channel, link to the submission detail page
    try {
      const recipients = await resolveRecipientsByRoles({ respectPrefs: true, channel: 'dispatch' });
      if (recipients.length) {
        await notifyUsers({
          title: 'New Dispatch Request',
          body: submission.location_label ? `Location: ${submission.location_label}` : undefined,
          level: 'info',
          channel: 'dispatch',
          link: `/dispatches/submission/${data.id}`,
          recipients,
        });
      }
    } catch (e) {
      console.warn('[dispatches] notify exception:', e);
    }

    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return jsonError(e);
  }
}
