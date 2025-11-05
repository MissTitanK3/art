import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Body = { profile_id: string; slot: 'hull' | 'engine' | 'comms' | 'aux' | 'scanner' | 'weapon' };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { profile_id, slot } = body || ({} as any);
  if (!profile_id || !slot) return NextResponse.json({ error: 'profile_id and slot required' }, { status: 400 });

  const { data: existing, error: e0 } = await supabase
    .from('ship_components')
    .select('*')
    .eq('profile_id', profile_id)
    .eq('slot', slot)
    .maybeSingle();
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: 'No component installed in this slot' }, { status: 400 });

  const curLevel = Number((existing as any).level || 1);
  const nextLevel = curLevel + 1;
  const nextIntegrity = Math.min(1, Math.max(Number((existing as any).integrity || 0), 0.9));

  const { data, error } = await supabase
    .from('ship_components')
    .update({ level: nextLevel, integrity: nextIntegrity })
    .eq('id', (existing as any).id)
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ component: data });
}
