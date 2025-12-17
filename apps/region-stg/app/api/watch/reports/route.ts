import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureSupabaseEnv } from '@/lib/auth/supabase/utils';
import { WizardReport } from '@workspace/store/types/watch.ts';

const PAGE_SIZE = 1000;

export async function GET(req: Request) {
  try {
    const env = ensureSupabaseEnv('wizard');
    const key = env.serviceRoleKey ?? env.anonKey;

    if (!env.url || !key) {
      return NextResponse.json({ error: 'Wizard Supabase environment is not configured.' }, { status: 500 });
    }

    const supabase = createClient(env.url, key, {
      auth: { persistSession: false },
    });

    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get('since');
    const includeTests = searchParams.get('includeTests') === 'true';

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    const reports: WizardReport[] = [];
    let offset = 0;
    let total: number | null = null;

    while (true) {
      let query = supabase
        .from('wizard')
        .select('*', { count: 'exact', head: false })
        .order('timestamp', { ascending: false });

      if (sinceParam) {
        query = query.gte('timestamp', sinceParam);
      }

      if (!includeTests) {
        query = query.or('test.eq.false,test.is.null');
      }

      // Filter out future reports (allow a small buffer for clock skew if needed, but strict for now)
      const now = new Date().toISOString();
      query = query.lte('timestamp', now);

      // Apply limit if present and smaller than PAGE_SIZE
      const effectiveLimit = limit ? Math.min(limit, PAGE_SIZE) : PAGE_SIZE;
      query = query.range(offset, offset + effectiveLimit - 1);

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) {
        break;
      }

      reports.push(...data);

      if (limit && reports.length >= limit) {
        break;
      }

      if (total === null && typeof count === 'number') {
        total = count;
      }

      offset += data.length;

      if (total !== null && offset >= total) {
        break;
      }

      if (data.length < PAGE_SIZE) {
        break;
      }
    }

    return NextResponse.json({ reports });
  } catch (err: any) {
    const message = err?.message ?? 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
