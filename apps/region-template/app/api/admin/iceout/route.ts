import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchIceoutReports, DEFAULT_ICEOUT_TOKEN } from '@workspace/store/integrations/iceout';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { regionAdmins } from '@workspace/store/utils/nav';

const SYNC_LOOKBACK_DAYS = Number(process.env.ICEOUT_SYNC_LOOKBACK_DAYS ?? '7');
const ICEOUT_ENDPOINT = process.env.ICEOUT_REPORTS_URL ?? 'https://iceout.org/api/reports/';

function getIceoutToken() {
  return process.env.ICEOUT_REPORTS_TOKEN ?? process.env.NEXT_PUBLIC_ICEOUT_REPORTS_TOKEN ?? DEFAULT_ICEOUT_TOKEN;
}

async function assertAdminAccess() {
  const session = await requireServerSession();
  let authorized = regionAdmins.includes(session.user.role);
  if (!authorized) {
    const callerProfile = await getProfileByUserId(session.user.id);
    authorized =
      !!callerProfile &&
      (callerProfile.access_role === 'dispatcher_admin' || callerProfile.access_role === 'dispatcher_verified');
  }
  if (!authorized) {
    throw new Error('Forbidden');
  }
  return session;
}

function getAdminClient() {
  const env = ensureSupabaseEnv('wizard');
  const serviceKey = env.serviceRoleKey;
  if (!serviceKey) {
    throw new Error('Server not configured with service role key');
  }
  return createClient(env.url, serviceKey);
}

export async function GET() {
  try {
    await assertAdminAccess();
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('wizard')
      .select('synced_at')
      .eq('external_source', 'iceout')
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({
      lastSyncedAt: data?.synced_at ?? null,
    });
  } catch (err: any) {
    const status = err?.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAdminAccess();
    const adminClient = getAdminClient();
    const token = getIceoutToken();
    if (!token) {
      return NextResponse.json({ error: 'Iceout token not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const overrideSince = typeof body?.since === 'string' ? body.since : null;

    const { data: lastRow } = await adminClient
      .from('wizard')
      .select('synced_at, timestamp')
      .eq('external_source', 'iceout')
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const fallbackSince = new Date(Date.now() - SYNC_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const baseSince = overrideSince ?? lastRow?.synced_at ?? lastRow?.timestamp ?? null;

    let sinceIso = baseSince ?? fallbackSince;
    const parsed = new Date(sinceIso);
    if (isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) {
      sinceIso = fallbackSince;
    } else {
      sinceIso = parsed.toISOString();
    }

    const reports = await fetchIceoutReports({
      sinceIso,
      token,
      endpoint: ICEOUT_ENDPOINT,
    });

    if (!reports.length) {
      return NextResponse.json({
        inserted: 0,
        checked: 0,
        lastSyncedAt: null,
        message: 'No new reports found',
      });
    }

    const externalIds = reports.map((r) => r.external_id);
    const { data: existing, error: existingError } = await adminClient
      .from('wizard')
      .select('external_id')
      .in('external_id', externalIds);
    if (existingError) throw existingError;

    const existingSet = new Set(
      (existing ?? []).map((row: { external_id: string | null }) => row.external_id).filter(Boolean) as string[],
    );

    const newReports = reports.filter((report) => !existingSet.has(report.external_id));

    if (!newReports.length) {
      return NextResponse.json({
        inserted: 0,
        checked: reports.length,
        lastSyncedAt: null,
        message: 'All reports already synced',
      });
    }

    const syncedAt = new Date().toISOString();
    const payload = newReports.map((report) => ({
      ...report,
      synced_at: syncedAt,
    }));

    const { error: insertError } = await adminClient.from('wizard').insert(payload);
    if (insertError) throw insertError;

    return NextResponse.json({
      inserted: payload.length,
      checked: reports.length,
      lastSyncedAt: syncedAt,
    });
  } catch (err: any) {
    const status = err?.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status });
  }
}
