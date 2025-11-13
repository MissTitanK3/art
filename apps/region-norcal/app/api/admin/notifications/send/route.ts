import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { regionAdmins } from '@workspace/store/utils/nav';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { createClient } from '@supabase/supabase-js';
import {
  getAdminNotificationTemplateDefaults,
  type AdminNotificationTemplateKey,
} from '@workspace/store/admin/notifications/templates';
import type { NotificationChannel, NotificationLevel } from '@workspace/store/types/notifications';

type Body = Partial<{
  template: AdminNotificationTemplateKey;
  title: string;
  body: string;
  level: NotificationLevel;
  channel: NotificationChannel;
  link?: string;
  sticky?: boolean;
  ttlMinutes?: number | null;
  recipientUserIds?: string[]; // UUID strings; if omitted, targets all profiles with a user_id
  roles?: string[]; // access_role filters
  groups?: ('dispatchers' | 'admins' | 'leaders')[]; // role group presets
}>;

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    // Determine authorization based on the caller's application role
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('access_role')
      .or(`id.eq.${userData.user.id},user_id.eq.${userData.user.id}`)
      .limit(1);
    const callerAccessRole = profileRows?.[0]?.access_role as any | undefined;
    const authorized =
      !!callerAccessRole && (regionAdmins.includes(callerAccessRole) || callerAccessRole === 'dispatcher_admin');
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json()) as Body;

    // Resolve content
    const preset = body.template ? getAdminNotificationTemplateDefaults(body.template) : null;
    const title = body.title ?? preset?.title ?? 'Notification';
    const msg = body.body ?? preset?.body ?? '';
    const level = body.level ?? preset?.level ?? 'info';
    const channel = (body.channel ?? preset?.channel ?? 'system') as NotificationChannel;
    const link = body.link ?? preset?.link ?? null;
    const sticky = Boolean(body.sticky);
    const expires_at = body.ttlMinutes ? new Date(Date.now() + body.ttlMinutes * 60_000).toISOString() : null;

    // Build recipients
    // Use service role key to bypass RLS for creating notifications AND resolving recipients/prefs
    const env = ensureSupabaseEnv('server');
    if (!env.serviceRoleKey) return NextResponse.json({ error: 'SERVER_MISSING_SERVICE_ROLE' }, { status: 500 });
    const admin = createClient(env.url, env.serviceRoleKey);

    let recipients: string[] = [];
    if (Array.isArray(body.recipientUserIds) && body.recipientUserIds.length > 0) {
      recipients = body.recipientUserIds;
    } else {
      // Build role filters if provided
      const roleSet = new Set<string>();
      const groups = Array.isArray(body.groups) ? body.groups : [];
      for (const g of groups) {
        if (g === 'dispatchers') {
          ['dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin'].forEach((r) => roleSet.add(r));
        } else if (g === 'admins') {
          ['dispatcher_admin', 'admin', 'regional_admin', 'national_admin'].forEach((r) => roleSet.add(r));
        } else if (g === 'leaders') {
          ['pod_leader', 'trainer'].forEach((r) => roleSet.add(r));
        }
      }
      const roles = Array.isArray(body.roles) ? body.roles.filter(Boolean) : [];
      roles.forEach((r) => roleSet.add(r));

      // Target either by roles or everyone
      let profilesQuery = admin.from('profiles').select('user_id, access_role').not('user_id', 'is', null);
      if (roleSet.size > 0) {
        profilesQuery = profilesQuery.in('access_role', Array.from(roleSet));
      }
      const { data, error } = await profilesQuery;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const allIds = (data ?? []).map((r: any) => r.user_id).filter(Boolean);
      if (allIds.length === 0) return NextResponse.json({ error: 'NO_RECIPIENTS' }, { status: 400 });

      // Fetch notification preferences for these users (if table exists)
      let prefs: Array<{
        user_id: string;
        global_opt_out: boolean | null;
        muted_channels: string[] | null;
      }> = [];
      try {
        const { data: prefRows } = await admin
          .from('notification_prefs')
          .select('user_id, global_opt_out, muted_channels')
          .in('user_id', allIds as any);
        prefs = prefRows ?? [];
      } catch {
        prefs = [];
      }
      const mutedByUser = new Map<string, { global_opt_out: boolean; muted_channels: string[] }>();
      for (const p of prefs) {
        mutedByUser.set(p.user_id, {
          global_opt_out: Boolean(p.global_opt_out),
          muted_channels: Array.isArray(p.muted_channels) ? p.muted_channels : [],
        });
      }
      recipients = allIds.filter((uid) => {
        const pref = mutedByUser.get(uid);
        if (!pref) return true;
        if (pref.global_opt_out) return false;
        if (pref.muted_channels?.includes(channel)) return false;
        return true;
      });
    }
    if (recipients.length === 0) return NextResponse.json({ error: 'NO_RECIPIENTS' }, { status: 400 });

    // Call RPC with required arg order (title, user_ids, ...)
    const { data: createdId, error: rpcErr } = await admin.rpc('create_notification_for_users', {
      p_title: title,
      p_user_ids: recipients as any,
      p_body: msg,
      p_level: level,
      p_channel: channel,
      p_link: link,
      p_sticky: sticky,
      p_expires_at: expires_at,
      p_meta: null,
    });
    if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      id: createdId ?? null,
      recipientsCount: recipients.length,
    });
  } catch (e: any) {
    return jsonError(e);
  }
}
