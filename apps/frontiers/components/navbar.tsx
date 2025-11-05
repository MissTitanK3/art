"use client"

import { useEffect, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { triggerResonance } from '@/lib/resonanceClient'
import ThemeToggle from '@workspace/ui/components/client/ThemeToggle'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useMissionsStore } from '@/store/useMissionsStore'
import { useProfileStore } from '@/store/useProfileStore'
import { Map, User } from 'lucide-react'


export function Navbar() {
  const { session } = useAuth()


  const onSupportNetwork = async () => {
    try {
      await triggerResonance('support-network')
    } catch (e) {
      // no-op stub; future funding hooks can handle feedback
      console.error(e)
    }
  }



  return (
    <header className="w-full border-b bg-background/50 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="text-sm font-medium flex items-center justify-between mb-5 gap-2">
          <Link href="/" className="hover:underline">
            <span>Frontiers</span>
          </Link>
          <Link href="/" className="ml-1 text-muted-foreground hover:text-foreground" title="View Fullscreen Map">
            <Map className="inline-block h-4 w-4 mb-0.5" />
          </Link>
          <Button asChild size="sm" variant="secondary">
            <Link href="/profile">
              <User className="inline-block h-4 w-4 mb-0.5 mr-1" />
            </Link>
          </Button>
        </div>
        <nav className="flex items-center justify-center gap-4">
          <ThemeToggle />
          <AuthControls />
        </nav>
      </div>
    </header>
  )
}

function AuthControls() {
  const [session, setSession] = useState<any>(null)
  const profileId = useProfileStore((s) => s.profile?.id || null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  if (!session) return null
  return (
    <Button size="sm" variant="outline" onClick={async () => {
      try {
        const rows = useMissionsStore.getState().snapshotForSync(profileId)
        if (rows.length > 0) {
          await fetch('/api/campaigns/progress', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rows }) })
        }
      } catch { }
      await supabase.auth.signOut()
    }}>
      Sign out
    </Button>
  )
}
