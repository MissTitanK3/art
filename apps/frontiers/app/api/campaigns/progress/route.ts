import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

type Row = {
  profile_id: string
  campaign_id: string
  mission_id: string
  progress: any
  completed_at: string | null
}

export async function POST(req: Request) {
  try {
    const { rows } = (await req.json()) as { rows?: Row[] }
    if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ ok: true, rows: 0 })
    const payload = rows.map((r) => ({
      profile_id: r.profile_id,
      campaign_id: r.campaign_id,
      mission_id: r.mission_id,
      progress: r.progress ?? {},
      completed_at: r.completed_at ?? null,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('campaign_mission_progress')
      .upsert(payload, { onConflict: 'profile_id,mission_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, rows: payload.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to sync' }, { status: 500 })
  }
}

