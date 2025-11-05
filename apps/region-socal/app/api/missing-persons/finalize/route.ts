import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';
import { createClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

type Intake = {
  caseId: string;
  fullName?: string;
};

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    const callerProfile = await getProfileByUserId(userData.user.id);
    const callerAccessRole = callerProfile?.access_role as any | undefined;
    const authorized =
      !!callerAccessRole &&
      (regionAdmins.includes(callerAccessRole) ||
        ['dispatcher_admin', 'dispatcher_verified'].includes(callerAccessRole));
    if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const payload = (await req.json()) as { record?: Intake; slug?: string };
    const record = payload?.record;
    if (!record?.caseId) return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });

    const env = ensureSupabaseEnv('server');
    const serviceKey = env.serviceRoleKey;
    if (!serviceKey) return NextResponse.json({ error: 'Service role not configured' }, { status: 501 });
    const adminClient = createClient(env.url, serviceKey);

    // Fetch active advocacy groups
    const { data: groups, error: groupsErr } = await adminClient
      .from('advocacy_groups')
      .select('*')
      .eq('active_status', true);
    if (groupsErr) return NextResponse.json({ error: groupsErr.message }, { status: 500 });

    const slug = payload?.slug ?? record.caseId;
    const webUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/missing-persons/${encodeURIComponent(slug)}`;

    // Prepare and log deliveries (demo: no actual email/signal integration in this environment)
    const results: Array<{ group_id: string; status: string }> = [];
    for (const g of Array.isArray(groups) ? groups : []) {
      const format = (g as any)?.preferred_format as string | null;
      let status = 'queued';
      const details: Record<string, unknown> = {
        destination: {
          emails: (g as any)?.contact_emails ?? [],
          signal: (g as any)?.contact_signal ?? null,
        },
        format,
        note: 'Delivery recorded; external sending not configured in this demo environment.',
      };

      if (format === 'web') {
        details['web_url'] = webUrl;
        status = 'sent';
      } else if (format === 'feed') {
        details['json'] = { caseId: record.caseId, fullName: record.fullName ?? null };
        status = 'sent';
      } else if (format === 'pdf') {
        // In a full environment, generate and attach a PDF here.
        details['attachment'] = 'pdf_prepared';
        status = 'queued';
      }

      const { error: logErr } = await adminClient.from('advocacy_delivery_logs').insert({
        group_id: (g as any)?.id,
        case_id: record.caseId,
        format,
        status,
        details,
      });
      if (logErr) {
        results.push({ group_id: (g as any)?.id, status: 'failed' });
      } else {
        results.push({ group_id: (g as any)?.id, status });
      }
    }

    // Fire-and-forget: notify all users (respecting prefs) that a case was finalized
    // Do not block the response on notification creation
    setTimeout(async () => {
      try {
        const recipients = await resolveRecipientsByRoles({ respectPrefs: true, channel: 'advocacy' });
        if (recipients.length > 0) {
          await notifyUsers({
            title: 'Missing Persons Update',
            body: record.fullName
              ? `Case finalized for ${record.fullName}.`
              : 'A missing persons case has been finalized.',
            level: 'info',
            channel: 'advocacy',
            link: webUrl,
            sticky: false,
            recipients,
          });
        }
      } catch (e) {
        console.warn('[missing-persons/finalize] notify-all failed', e);
      }
    }, 0);

    return NextResponse.json({ ok: true, deliveries: results });
  } catch (e: any) {
    return jsonError(e);
  }
}
