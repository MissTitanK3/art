import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createClient } from '@supabase/supabase-js';
import { regionAdmins } from '@workspace/store/utils/nav';

/**
 * Notify dispatcher_admin+ that a new user has signed up and likely needs onboarding.
 *
 * Authorization: any authenticated user may call this endpoint for themselves.
 * The service-role client is used to fan out the notification to admins.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const user = userData.user;

    // Fetch the caller's profile (scoped by RLS to self)
    const { data: rows, error: profErr } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, affiliation, city, state, access_role, verified_by, inserted_at, contact_signal, self_status_flags')
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .limit(1);
    if (profErr) throw profErr;
    const profile = Array.isArray(rows) ? rows[0] : (rows as any);

    // Heuristic: Notify when self-verified or base access role suggests onboarding needed.
    const needsOnboarding = !profile || profile.verified_by === 'self' || profile.access_role === 'team_member';
    if (!needsOnboarding) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Use service role to target admins and create the notification
    const env = ensureSupabaseEnv('server');
    if (!env.serviceRoleKey) return NextResponse.json({ error: 'SERVER_MISSING_SERVICE_ROLE' }, { status: 500 });
    const admin = createClient(env.url, env.serviceRoleKey);

    // Dedup: if we've already sent an onboarding notice, skip
    if (profile?.self_status_flags && Array.isArray(profile.self_status_flags)) {
      if (profile.self_status_flags.includes('onboarding_notice_sent')) {
        return NextResponse.json({ ok: true, skipped: true, reason: 'already_notified' });
      }
    }

    // Tighten to a new-user window (defaults to 24h, override via env)
    const windowHours = Number.parseInt(process.env.ONBOARDING_NOTIFY_WINDOW_HOURS || '24', 10);
    if (profile?.inserted_at && Number.isFinite(windowHours) && windowHours > 0) {
      const inserted = new Date(profile.inserted_at).getTime();
      if (Number.isFinite(inserted)) {
        const ageMs = Date.now() - inserted;
        const limitMs = windowHours * 60 * 60 * 1000;
        if (ageMs > limitMs) {
          return NextResponse.json({ ok: true, skipped: true, reason: 'outside_window' });
        }
      }
    }

    // Resolve recipients: dispatcher_admin + regionAdmins
    const roleSet = new Set<string>(['dispatcher_admin', ...regionAdmins]);
    const { data: recipientRows, error: recErr } = await admin
      .from('profiles')
      .select('user_id, access_role')
      .not('user_id', 'is', null)
      .in('access_role', Array.from(roleSet));
    if (recErr) throw recErr;
    const recipientIds = (recipientRows ?? []).map((r: any) => r.user_id).filter(Boolean);
    if (recipientIds.length === 0) return NextResponse.json({ error: 'NO_RECIPIENTS' }, { status: 400 });

    const name = (profile?.display_name || (user?.email?.split?.('@')?.[0] ?? 'New user')).toString();
    const location = [profile?.city, profile?.state].filter(Boolean).join(', ');
    const affiliation = profile?.affiliation ? ` • ${profile.affiliation}` : '';
    const locationSuffix = location ? ` • ${location}` : '';
    const signal = profile?.contact_signal ? `Signal: ${profile.contact_signal}` : '';
    const email = user?.email ? `Email: ${user.email}` : '';
    const contactLine = [signal, email].filter(Boolean).join(' • ');

    const title = 'New user needs onboarding';
    const body = `${name}${affiliation}${locationSuffix} just signed up and may need onboarding.${contactLine ? `\n${contactLine}` : ''}`;
    const channel = 'system';
    const level = 'info';
    const link = '/admin/profiles';
    const sticky = false;
    const expires_at = new Date(Date.now() + 24 * 60 * 60_000).toISOString();

    // Create notification to targeted users
    const { data: createdId, error: rpcErr } = await admin.rpc('create_notification_for_users', {
      p_title: title,
      p_user_ids: recipientIds as any,
      p_body: body,
      p_level: level,
      p_channel: channel,
      p_link: link,
      p_sticky: sticky,
      p_expires_at: expires_at,
      p_meta: { type: 'onboarding_notice', subject_user_id: user.id } as any,
    });
    if (rpcErr) throw rpcErr;

    // Mark profile to indicate we sent an onboarding notice
    try {
      const nextFlags = Array.isArray(profile?.self_status_flags)
        ? Array.from(new Set([...(profile.self_status_flags as string[]), 'onboarding_notice_sent']))
        : ['onboarding_notice_sent'];
      if (profile?.id) {
        await admin.from('profiles').update({ self_status_flags: nextFlags as any }).eq('id', profile.id);
      }
    } catch {
      // non-blocking
    }

    return NextResponse.json({ ok: true, id: createdId ?? null, recipientsCount: recipientIds.length });
  } catch (e: any) {
    return jsonError(e);
  }
}
