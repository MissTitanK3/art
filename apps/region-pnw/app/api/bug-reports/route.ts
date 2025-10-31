import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { jsonError } from '@/lib/api/responses';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || '').trim();
    const area = String(body?.area || 'general').trim();
    const steps = body?.steps ? String(body.steps) : null;
    const expected = body?.expected ? String(body.expected) : null;
    const actual = body?.actual ? String(body.actual) : null;

    if (!title || title.length < 5) {
      return NextResponse.json({ error: 'Title is required (min 5 chars)' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        title,
        area,
        steps,
        expected,
        actual,
        created_by: userData.user.id,
        status: 'open',
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data?.id, created_at: data?.created_at }, { status: 201 });
  } catch (e: any) {
    return jsonError(e);
  }
}

