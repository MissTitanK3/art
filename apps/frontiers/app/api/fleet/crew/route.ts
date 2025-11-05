import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const profileId = url.searchParams.get('profile_id')
  if (!profileId) return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 })

  const { data: rows1, error: e1 } = await supabase
    .from('connections')
    .select('source_id,recipient_id')
    .eq('source_id', profileId)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  const { data: rows2, error: e2 } = await supabase
    .from('connections')
    .select('source_id,recipient_id')
    .eq('recipient_id', profileId)
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  const neighbors = new Set<string>()
  for (const r of rows1 || []) neighbors.add(r.recipient_id)
  for (const r of rows2 || []) neighbors.add(r.source_id)
  neighbors.delete(profileId)
  const list = Array.from(neighbors)

  // Load trust from connections_v2 if both ids are UUIDs
  let trustMap: Record<string, number> = {}
  if (isUUID(profileId)) {
    const uuidPeers = list.filter(isUUID)
    if (uuidPeers.length) {
      const { data: t1 } = await supabase
        .from('connections_v2')
        .select('source_id,target_id,trust')
        .eq('source_id', profileId)
        .in('target_id', uuidPeers)
      const { data: t2 } = await supabase
        .from('connections_v2')
        .select('source_id,target_id,trust')
        .in('source_id', uuidPeers)
        .eq('target_id', profileId)
      const rows = [...(t1 || []), ...(t2 || [])]
      for (const r of rows) {
        const other = r.source_id === profileId ? r.target_id : r.source_id
        trustMap[other] = Math.max(trustMap[other] || 0, Number(r.trust || 0))
      }
    }
  }

  return NextResponse.json({ crew: list.map((id) => ({ id, trust: trustMap[id] ?? null })) })
}

