import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { isKindAllowed } from '@/lib/componentsCatalog';

export const runtime = 'nodejs';

type Body = { profile_id: string; slot: 'hull' | 'engine' | 'comms' | 'aux' | 'scanner' | 'weapon'; kind: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { profile_id, slot, kind } = body || ({} as any);
  if (!profile_id || !slot || !kind)
    return NextResponse.json({ error: 'profile_id, slot and kind required' }, { status: 400 });
  if (!isKindAllowed(slot, kind)) return NextResponse.json({ error: 'Kind not allowed for slot' }, { status: 400 });

  const { data: existing, error: e0 } = await supabase
    .from('ship_components')
    .select('*')
    .eq('profile_id', profile_id)
    .eq('slot', slot)
    .maybeSingle();
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });

  if (!existing) {
    // Insert fresh
    const { data, error } = await supabase
      .from('ship_components')
      .insert({ profile_id, slot, kind, level: 1, integrity: 1 })
      .select('*')
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ component: data, created: true });
  } else {
    // Replace kind, preserve level, reset integrity
    const { data, error } = await supabase
      .from('ship_components')
      .update({ kind, integrity: 1 })
      .eq('id', (existing as any).id)
      .select('*')
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ component: data, created: false });
  }
}
