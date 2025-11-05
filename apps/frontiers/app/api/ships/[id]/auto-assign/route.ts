import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Strategy = 'balanced' | 'max-repair' | 'max-signal' | 'max-morale';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: shipId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { profile_id?: string; strategy?: Strategy };
  const profileId = body.profile_id;
  const strategy: Strategy = body.strategy || 'balanced';
  if (!profileId) return NextResponse.json({ error: 'profile_id required' }, { status: 400 });

  // Load template
  const { data: template, error: e1 } = await supabase
    .from('ship_position_templates')
    .select('position_id, slots, shifts')
    .eq('ship_id', shipId);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // Load hired crew
  const { data: hired, error: e2 } = await supabase
    .from('profile_crew')
    .select('crew_id, crew:crew_catalog(*)')
    .eq('profile_id', profileId)
    .eq('status', 'active');
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  const pool = (hired || []).map((h) => h.crew).filter(Boolean) as any[];

  // Simple scoring by strategy and allowed_positions match
  const scoreCrew = (positionId: string, crew: any) => {
    let score = 0;
    if (Array.isArray(crew.allowed_positions) && crew.allowed_positions.includes(positionId)) score += 3;
    const b = crew.bonuses || {};
    switch (strategy) {
      case 'max-repair':
        score += (b.repair_bonus || 0) * 100;
        break;
      case 'max-signal':
        score += ((b.signal_yield || 0) + (b.signal_clarity || 0)) * 100;
        break;
      case 'max-morale':
        score += (b.morale_recovery || 0) * 100;
        break;
      default:
        score +=
          ((b.repair_bonus || 0) + (b.route_efficiency || 0) + (b.signal_yield || 0) + (b.morale_recovery || 0)) * 50;
    }
    // prefer higher tier
    score += (crew.tier || 1) * 0.5;
    return score;
  };

  // Greedy assignment per seat
  const upserts: any[] = [];
  const usedCrew = new Set<string>();
  for (const t of template || []) {
    const slots = Math.max(1, Number((t as any).slots || 1));
    const shifts = Math.max(1, Number((t as any).shifts || 1));
    for (let s = 0; s < slots; s++) {
      for (let sh = 1; sh <= shifts; sh++) {
        const ranked = pool
          .filter((c) => !usedCrew.has(c.id))
          .map((c) => ({ c, s: scoreCrew((t as any).position_id, c) }))
          .sort((a, b) => b.s - a.s);
        const pick = ranked[0]?.c;
        if (pick) {
          usedCrew.add(pick.id);
          upserts.push({
            profile_id: profileId,
            ship_id: shipId,
            position_id: (t as any).position_id,
            slot_index: s,
            shift: sh,
            crew_id: pick.id,
          });
        }
      }
    }
  }

  if (upserts.length === 0) return NextResponse.json({ ok: true, assigned: 0 });

  const { error } = await supabase
    .from('profile_ship_positions')
    .upsert(upserts, { onConflict: 'profile_id,ship_id,position_id,slot_index,shift' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, assigned: upserts.length });
}
