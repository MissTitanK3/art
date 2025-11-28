import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Delete the shift (we don't need to verify pod ownership for deletes)
    const { error } = await supabase.rpc('safe_delete_pod_shift', {
      p_id: id,
    });

    if (error) {
      console.error(`[DELETE /api/pods/[slug]/shifts/${id}] Database error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/pods/[slug]/shifts/[id]] Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete shift' }, { status: 500 });
  }
}
