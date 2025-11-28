import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    const supabase = await createSupabaseServerClient();

    // First, get the pod ID from the slug
    const { data: pod, error: podError } = await supabase.from('pods').select('id').eq('slug', slug).maybeSingle();

    if (podError) {
      console.error(`[DELETE /api/pods/${slug}/roster/${id}] Pod fetch error:`, podError);
      return NextResponse.json({ error: podError.message }, { status: 500 });
    }

    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 });
    }

    // Ensure roster entry belongs to the pod before deleting
    const { data: rosterEntry, error: rosterFetchError } = await supabase
      .from('roster_entries')
      .select('id')
      .eq('pod_id', pod.id)
      .eq('id', id)
      .maybeSingle();

    if (rosterFetchError) {
      console.error(`[DELETE /api/pods/${slug}/roster/${id}] Fetch error:`, rosterFetchError);
      return NextResponse.json({ error: rosterFetchError.message }, { status: 500 });
    }

    if (!rosterEntry) {
      return NextResponse.json({ error: 'Roster entry not found' }, { status: 404 });
    }

    const { error } = await supabase.rpc('safe_delete_roster_entry', { p_id: id });

    if (error) {
      console.error(`[DELETE /api/pods/${slug}/roster/${id}] RPC error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/pods/[slug]/roster/[id]] Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete roster entry' }, { status: 500 });
  }
}
