import { NextResponse } from 'next/server';
import type { ShipComponent } from '@/schemas/ship_components';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
// Ensure this route is always dynamic so clients get fresh catalog data
export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('component_catalog')
    .select('id, slot, name, description, tier, base, per_level, upgrade_cost_base, upgrade_cost_growth, replace_cost')
    .order('slot', { ascending: true })
    .order('tier', { ascending: true })
    .order('id', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const grouped: Record<ShipComponent['slot'], any[]> = {
    hull: [],
    engine: [],
    comms: [],
    aux: [],
    scanner: [],
    weapon: [],
  } as any;
  for (const r of data || []) {
    const item = {
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      tier: r.tier ?? undefined,
      base: r.base ?? undefined,
      perLevel: r.per_level ?? undefined,
      upgradeCostBase: r.upgrade_cost_base ?? undefined,
      upgradeCostGrowth: r.upgrade_cost_growth ?? undefined,
      replaceCost: r.replace_cost ?? undefined,
    };
    (grouped[r.slot as ShipComponent['slot']] ||= []).push(item);
  }
  return NextResponse.json({ catalog: grouped });
}
