"use client"

import { useProfileStore } from '@/store/useProfileStore'
import { useAchievementsStore } from '@/store/useAchievementsStore'
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'

const BADGE_EMOJI: Record<string, string> = {
  wrench: '🛠️',
  wave: '📡',
  moon: '🌙',
  laurel: '🏅',
}

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  const setProfile = useProfileStore((s) => s.setProfile)
  const xp = useProfileStore((s) => s.engineering_xp)
  const regionId = useProfileStore((s) => s.region_id)
  const sectorCode = useProfileStore((s) => s.sector_code)
  const dock_lat = useProfileStore((s: any) => s.dock_lat as number | null)
  const dock_lng = useProfileStore((s: any) => s.dock_lng as number | null)
  const dock_radius_km = useProfileStore((s: any) => s.dock_radius_km as number | null)
  const setDock = useProfileStore((s: any) => s.setDock as (lat: number, lng: number, radiusKm?: number) => void)
  const clearDock = useProfileStore((s: any) => s.clearDock as () => void)

  const name = profile?.display_name || ''

  async function ensureProfile() {
    if (!profile) {
      setProfile({
        id: 'local-user',
        display_name: 'Explorer',
        region_id: regionId || 'region-pnw',
        sector_code: sectorCode || undefined,
      } as any)
    }
  }

  function onNameChange(next: string) {
    const base = profile || { id: 'local-user', region_id: regionId || 'region-pnw' }
    setProfile({ ...(base as any), display_name: next })
  }

  async function setDockHere() {
    try {
      const pos = await getPosition()
      const lat = round2(pos.coords.latitude)
      const lng = round2(pos.coords.longitude)
      setDock(lat, lng, 0.4023)
    } catch {
      // ignore
    }
  }
  const defs = useAchievementsStore((s) => s.list())
  const unlocked = useAchievementsStore((s) => s.unlocked)

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="text-sm text-muted-foreground">{profile?.display_name || 'Anonymous'} · XP {xp}</div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" value={name} onChange={(e) => onNameChange(e.target.value)} onFocus={ensureProfile} placeholder="Your callsign" />
            </div>
            <div className="space-y-1">
              <Label>Region · Sector</Label>
              <div className="h-9 px-3 inline-flex items-center rounded border bg-muted/30 text-sm text-muted-foreground">
                {(regionId || '—')} · {(sectorCode || '—')}
              </div>
            </div>
          </div>
          {!profile && (
            <Button variant="secondary" onClick={ensureProfile}>Create local profile</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {Number.isFinite(dock_lat) && Number.isFinite(dock_lng) ? (
              <div>
                Dock set at ~ {(dock_lat as number).toFixed(4)}, {(dock_lng as number).toFixed(4)} · radius {(dock_radius_km ?? 0.4023).toFixed(4)} km
              </div>
            ) : (
              <div>No dock set.</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={setDockHere}>Set Dock to my location</Button>
            <Button size="sm" variant="outline" onClick={clearDock} disabled={!Number.isFinite(dock_lat) || !Number.isFinite(dock_lng)}>Clear</Button>
          </div>
          <div className="text-[11px] text-muted-foreground">Rest bonus applies within 0.4023 km of Dock.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {defs.map((a) => {
              const earned = unlocked[a.id]
              const badge = a.reward?.badge ? (BADGE_EMOJI[a.reward.badge] || '🎖️') : '🎖️'
              return (
                <li key={a.id} className={`border rounded p-2 ${earned ? 'bg-primary/5 border-primary/40' : 'opacity-60'}`} title={a.title}>
                  <div className="text-2xl leading-none">{badge}</div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-[10px] text-muted-foreground">{earned ? new Date(earned.earnedAt).toLocaleDateString() : 'Locked'}</div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}

// --- local helpers ---
function round2(n: number) { return Math.round(n * 100) / 100 }

async function getPosition(): Promise<GeolocationPosition> {
  if (!('geolocation' in navigator)) throw new Error('Geolocation not supported in this browser')
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 })
  })
}

