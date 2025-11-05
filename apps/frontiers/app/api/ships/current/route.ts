import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const profileId = url.searchParams.get('profile_id');
  if (!profileId) return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 });
  const { data, error } = await supabase
    .from('profile_ships')
    .select('profile_id, ship_id, acquired_at, updated_at, ship:ship_catalog(*)')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Also include components for convenience
  const { data: comps } = await supabase
    .from('ship_components')
    .select('*')
    .eq('profile_id', profileId)
    .order('slot', { ascending: true });
  return NextResponse.json({ current: data || null, components: comps || [] });
}

type Body = { profile_id: string; ship_id: string; seed_components?: boolean };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const { profile_id, ship_id, seed_components } = body || ({} as any);
  if (!profile_id || !ship_id) return NextResponse.json({ error: 'profile_id and ship_id required' }, { status: 400 });

  const { data: cat, error: e1 } = await supabase.from('ship_catalog').select('*').eq('id', ship_id).maybeSingle();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (!cat) return NextResponse.json({ error: 'Unknown ship_id' }, { status: 400 });

  const { data, error } = await supabase
    .from('profile_ships')
    .upsert({ profile_id, ship_id }, { onConflict: 'profile_id' })
    .select('profile_id, ship_id, acquired_at, updated_at')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optionally seed base components if empty for this profile using canonical IDs from component_catalog
  if (seed_components) {
    try {
      const { data: existing } = await supabase
        .from('ship_components')
        .select('id')
        .eq('profile_id', profile_id)
        .limit(1);

      if (!existing || existing.length === 0) {
        const base = (cat.base_slots || {}) as Record<string, string | null>;
        const wants: Array<{ slot: string; kind?: string | null }> = Object.entries(base).map(([slot, kind]) => ({
          slot,
          kind,
        }));
        const slots = wants.length ? wants.map((w) => w.slot) : ['hull', 'engine', 'comms', 'aux'];
        const { data: catalog, error: catErr } = await supabase
          .from('component_catalog')
          .select('id, slot, tier')
          .in('slot', slots)
          .order('tier', { ascending: true });
        if (catErr) throw catErr;
        const bySlot = new Map<string, Array<{ id: string; tier: number }>>();
        for (const row of catalog || []) {
          const arr = bySlot.get(row.slot) || [];
          arr.push({ id: row.id as string, tier: Number(row.tier || 0) });
          bySlot.set(row.slot, arr);
        }
        const rows = (wants.length ? wants : slots.map((s) => ({ slot: s, kind: null as string | null })))
          .map(({ slot, kind }) => {
            const list = bySlot.get(slot) || [];
            const pick =
              kind && list.some((x) => x.id === kind) ? kind : list.sort((a, b) => a.tier - b.tier)[0]?.id || null;
            return pick ? { profile_id, slot, kind: pick, level: 1, integrity: 1 } : null;
          })
          .filter(Boolean) as Array<{
          profile_id: string;
          slot: string;
          kind: string;
          level: number;
          integrity: number;
        }>;
        if (rows.length) await supabase.from('ship_components').insert(rows);
      }
    } catch {
      // ignore seeding errors to avoid blocking ship selection; components can be managed later
    }
  }

  // Load components to return in response
  const { data: comps } = await supabase
    .from('ship_components')
    .select('*')
    .eq('profile_id', profile_id)
    .order('slot', { ascending: true });

  return NextResponse.json({ current: data, components: comps || [] });
}
