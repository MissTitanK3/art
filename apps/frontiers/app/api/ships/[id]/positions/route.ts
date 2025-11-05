import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: shipId } = await context.params;
  const url = new URL(req.url);
  const profileId = url.searchParams.get('profile_id');

  const { data: template, error: e1 } = await supabase
    .from('ship_position_templates')
    .select('position_id, slots, required, shifts, positions_catalog:positions_catalog(*)')
    .eq('ship_id', shipId)
    .order('position_id', { ascending: true });

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  let assignments: any[] = [];
  if (profileId) {
    const { data: a, error: e2 } = await supabase
      .from('profile_ship_positions')
      .select('position_id, slot_index, shift, crew_id, crew:crew_catalog(*)')
      .eq('profile_id', profileId)
      .eq('ship_id', shipId);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    assignments = a || [];
  }

  return NextResponse.json({ template: template || [], assignments });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: shipId } = await context.params;
  const body = await req.json().catch(() => ({}) as any);
  const { profile_id, position_id, slot_index = 0, shift = 1, crew_id } = body || {};
  if (!profile_id || !position_id)
    return NextResponse.json({ error: 'profile_id and position_id required' }, { status: 400 });

  // Upsert assignment
  const { error } = await supabase
    .from('profile_ship_positions')
    .upsert(
      { profile_id, ship_id: shipId, position_id, slot_index, shift, crew_id },
      { onConflict: 'profile_id,ship_id,position_id,slot_index,shift' },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
