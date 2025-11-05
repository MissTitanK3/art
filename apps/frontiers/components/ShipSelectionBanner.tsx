"use client"

import * as React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfileStore } from '@/store/useProfileStore'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { fetchCurrentShipCached } from '@/lib/shipsApi'

export function ShipSelectionBanner() {
  const { session } = useAuth()
  const storeProfileId = useProfileStore((s) => s.profile?.id ?? null)
  const profileId = storeProfileId || session?.user?.id || null
  const [needed, setNeeded] = React.useState(false)

  React.useEffect(() => {
    let active = true
    const check = async () => {
      if (!profileId) { setNeeded(false); return }
      try {
        const json = await fetchCurrentShipCached(profileId, 60_000)
        if (!active) return
        setNeeded(!json?.current)
      } catch {
        if (active) setNeeded(false)
      }
    }
    check()
    const id = setInterval(check, 30000)
    return () => { active = false; clearInterval(id) }
  }, [profileId])

  if (!needed) return null
  return (
    <div className="fixed bottom-3 inset-x-0 flex justify-center z-50">
      <div className="max-w-xl w-[92%] sm:w-[640px] rounded-md border bg-card/95 backdrop-blur px-3 py-2 shadow">
        <div className="flex items-center justify-between gap-2 text-sm">
          <div>Select a ship to begin exploring.</div>
          <Button asChild size="sm">
            <Link href="/fleet#available-ships">Select ship</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
