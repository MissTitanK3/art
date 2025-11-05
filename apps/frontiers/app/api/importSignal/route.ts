import { NextRequest, NextResponse } from 'next/server'
import { importSignal } from '@/lib/syncSignals'

export const runtime = 'nodejs'

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const [, token] = auth.split(' ')
  return token && token === process.env.INTERNAL_KEY
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    // Basic validation
    const required = ['source_type', 'source_id', 'region_id', 'title']
    for (const k of required) {
      if (!body?.[k]) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 })
    }
    const record = await importSignal({
      source_type: body.source_type,
      source_id: body.source_id,
      region_id: body.region_id,
      title: body.title,
      summary: body.summary ?? '',
      tags: body.tags ?? [],
      expires_at: body.expires_at ?? null,
    })
    return NextResponse.json({ ok: true, record })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to import' }, { status: 500 })
  }
}
