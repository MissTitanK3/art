"use client"

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs'
import { toast } from 'sonner'
import type { ShipComponent } from '@/schemas/ship_components'
import type { CrewCatalog } from '@/schemas/crew'
import type { Assignment } from '@/schemas/positions'
import { StaffingTab } from '@/components/fleet/tabs/StaffingTab'
import { CurrentTab } from '@/components/fleet/tabs/CurrentTab'
import { HiredCrewTab } from '@/components/fleet/tabs/HiredCrewTab'
import { AvailableShipsTab } from '@/components/fleet/tabs/AvailableShipsTab'
import { ComponentsTab } from '@/components/fleet/tabs/ComponentsTab'
import { CrewMarketTab } from '@/components/fleet/tabs/CrewMarketTab'
import { AllianceTab } from '@/components/fleet/tabs/AllianceTab'
import { useShipCatalog } from '@/hooks/useShipCatalog'
import { useShipState } from '@/hooks/useShipState'
import { useShipComponents } from '@/hooks/useShipComponents'
import { useHiredCrew } from '@/hooks/useHiredCrew'
import { useCrewMarket } from '@/hooks/useCrewMarket'
import { useFleetAlliance } from '@/hooks/useFleetAlliance'
import { computeCrewFit } from '@/lib/crewScore'
import { useDerivedBonuses } from '@/hooks/useDerivedBonuses'
import { useStaffing } from '@/hooks/useStaffing'
import { computeKindStats } from '@/lib/componentsCatalog'

type Fleet = { id: string; name: string; region_id: string | null; leader_id: string | null; members: string[] | null }

export function FleetContainer({ profileId }: { profileId: string | null }) {
  // Tabs
  const TABS = ['staffing', 'current', 'available', 'components', 'market', 'alliance'] as const
  type Tab = typeof TABS[number]
  const [activeTab, setActiveTab] = React.useState<Tab>('current')

  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const t = sp.get('tab') as Tab | null
      if (t && (TABS as readonly string[]).includes(t)) setActiveTab(t as Tab)
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', activeTab)
      window.history.replaceState(null, '', url.toString())
    } catch { }
  }, [activeTab])

  // Ship catalog and selection
  const { catalog, catalogLoading, currentShip, setCurrentShip, selectShip, abandonShip } = useShipCatalog(profileId)
  // Ship state
  const { shipLoading, ship, resetting, onDockRepair } = useShipState(profileId)
  // Components
  const { componentsLoading, components, setComponents, catalogKinds, refreshComponents, doUpgrade, doReplace } = useShipComponents(profileId)

  // Install base components from current ship's template
  const installComponents = async () => {
    if (!profileId) return
    try {
      const shipId = currentShip?.ship_id || currentShip?.ship?.id
      if (!shipId) throw new Error('No ship selected')
      const res = await fetch('/api/ships/current', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, ship_id: shipId, seed_components: true })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to install')
      if (Array.isArray(json.components)) setComponents(json.components)
      toast.success('Components installed')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to install components')
    }
  }

  // Expected/missing slots
  const allSlotsForCurrent = React.useMemo(() => {
    const set = new Set<string>()
    const baseSlots = (currentShip as any)?.ship?.base_slots as Record<string, string> | undefined
    if (baseSlots && typeof baseSlots === 'object') {
      for (const k of Object.keys(baseSlots)) set.add(k)
    } else {
      for (const k of Object.keys(catalogKinds)) set.add(k)
    }
    return Array.from(set) as Array<ShipComponent['slot']>
  }, [currentShip, catalogKinds])

  const installedSlots = React.useMemo(() => new Set<ShipComponent['slot']>(components.map(c => c.slot)), [components])
  const missingSlots = React.useMemo(() => allSlotsForCurrent.filter(s => !installedSlots.has(s)), [allSlotsForCurrent, installedSlots])

  const getDefaultKindForSlot = React.useCallback((slot: ShipComponent['slot']) => {
    const baseSlots = (currentShip as any)?.ship?.base_slots as Record<string, string> | undefined
    const fromTemplate = baseSlots?.[slot]
    if (fromTemplate && typeof fromTemplate === 'string') return fromTemplate
    const kinds = (catalogKinds as any)[slot] || []
    if (kinds.length === 0) return null
    const sorted = [...kinds].sort((a, b) => (a.tier ?? 999) - (b.tier ?? 999))
    return sorted[0]?.id ?? kinds[0]?.id ?? null
  }, [currentShip, catalogKinds])

  const installComponentForSlot = async (slot: ShipComponent['slot']) => {
    const kind = getDefaultKindForSlot(slot)
    if (!kind) { toast.error('No available component for this slot'); return }
    await doReplace(slot, kind)
  }

  const [confirmUpgrade, setConfirmUpgrade] = React.useState<{ slot: ShipComponent['slot']; cost: number } | null>(null)
  const [confirmReplace, setConfirmReplace] = React.useState<{ slot: ShipComponent['slot']; kindId: string; cost: number; deltas: Array<[string, number, number]> } | null>(null)
  const [replaceOpen, setReplaceOpen] = React.useState<{ slot: ShipComponent['slot'] | null } | null>(null)

  const prepareUpgradeConfirm = (c: ShipComponent) => {
    const kinds = (catalogKinds as any)[c.slot] || []
    const k = kinds.find((x: any) => x.id === (c as any).kind)
    const base = Number(k?.upgradeCostBase || 0)
    const growth = Number(k?.upgradeCostGrowth || 0)
    const cost = Math.max(0, Math.round(base + growth * Math.max(1, c.level)))
    setConfirmUpgrade({ slot: c.slot, cost })
  }

  const prepareReplaceConfirm = (c: ShipComponent, newKindId: string) => {
    const kinds = (catalogKinds as any)[c.slot] || []
    const curK = kinds.find((x: any) => x.id === (c as any).kind)
    const nextK = kinds.find((x: any) => x.id === newKindId)
    const lvl = Math.max(1, Number(c.level || 1))
    const calc = (k?: any) => {
      const base = (k?.base || {}) as Record<string, number>
      const per = (k?.perLevel || {}) as Record<string, number>
      const out: Record<string, number> = { ...base }
      if (lvl > 1) for (const [kk, vv] of Object.entries(per)) out[kk] = (out[kk] || 0) + (Number(vv) || 0) * (lvl - 1)
      return out
    }
    const a = calc(curK)
    const b = calc(nextK)
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]))
    const deltas = keys.map((k) => [k, Number(a[k] || 0), Number(b[k] || 0)]) as Array<[string, number, number]>
    const cost = Math.max(0, Math.round(Number(nextK?.replaceCost || 0)))
    // Close the kind picker and open confirmation
    setReplaceOpen(null)
    setConfirmReplace({ slot: c.slot, kindId: newKindId, cost, deltas })
  }

  // crew market and hired crew
  const [marketFilter, setMarketFilter] = React.useState('')
  const [marketBestFit, setMarketBestFit] = React.useState(false)
  const [marketOnlyUncovered, setMarketOnlyUncovered] = React.useState(false)
  const { marketCrew, marketLoading } = useCrewMarket({ position: marketFilter || null })
  const { hiredCrew, hiredLoading, hireCrew, fireCrew } = useHiredCrew(profileId)

  // staffing
  const [autoStrategy, setAutoStrategy] = React.useState<'balanced' | 'max-repair' | 'max-signal' | 'max-morale'>('balanced')
  const { positionTemplates, assignments, setAssignments, saveAssignment, autoAssign: autoAssignApi } = useStaffing(profileId, currentShip)
  const autoAssign = () => autoAssignApi(autoStrategy)

  // uncovered needs and grouped market
  const uncoveredNeeds = React.useMemo(() => {
    const needs = new Set<string>()
    if (positionTemplates.length === 0) return needs
    for (const p of positionTemplates) {
      const slots = Math.max(1, Number(p.slots || 1))
      const shiftCount = Math.max(1, Number(p.shifts || 1))
      let assigned = 0
      for (let s = 0; s < slots; s++) {
        for (let sh = 1; sh <= shiftCount; sh++) {
          const a = assignments.find((x: Assignment) => x.position_id === p.position_id && x.slot_index === s && x.shift === sh)
          if (a?.crew_id) assigned++
        }
      }
      if (assigned === 0 || (p.required && assigned === 0)) needs.add(p.position_id)
    }
    return needs
  }, [positionTemplates, assignments])

  const groupedMarket = React.useMemo(() => {
    const m = new Map<string, CrewCatalog[]>()
    const source = marketOnlyUncovered && uncoveredNeeds.size > 0
      ? marketCrew.filter(c => (c.allowed_positions || []).some(p => uncoveredNeeds.has(String(p))))
      : marketCrew
    for (const c of source) {
      const role = c.role || 'Unassigned'
      const arr = m.get(role) ?? []
      arr.push(c)
      m.set(role, arr)
    }
    for (const [k, arr] of m) {
      const scoreFor = (c: CrewCatalog) => computeCrewFit(c, autoStrategy, uncoveredNeeds).score
      arr.sort((a, b) => {
        if (marketBestFit) {
          const sa = scoreFor(a), sb = scoreFor(b)
          if (sb !== sa) return sb - sa
        }
        return (a.tier - b.tier) || (a.name.localeCompare(b.name))
      })
      m.set(k, arr)
    }
    return m
  }, [marketCrew, marketBestFit, marketOnlyUncovered, uncoveredNeeds, autoStrategy])

  const orderedRoles = React.useMemo(() => {
    const preferred = ['Engineering', 'Navigation', 'Support', 'Ops']
    const roles = Array.from(groupedMarket.keys())
    const rest = roles.filter(r => !preferred.includes(r)).sort()
    return preferred.filter(r => roles.includes(r)).concat(rest)
  }, [groupedMarket])

  // derived bonuses (from staffing)
  const { derivedBonuses, derivedBreakdown } = useDerivedBonuses(profileId, [assignments])

  // Aggregate component bonuses for Current tab context
  const componentBreakdown = React.useMemo(() => {
    if (!components || !catalogKinds) return [] as Array<{ slot: ShipComponent['slot']; name: string; tier?: number; level: number; contributions: Record<string, number> }>
    return components.map((c) => {
      const kinds = (catalogKinds as any)[c.slot] || []
      const k = kinds.find((x: any) => x.id === (c as any).kind)
      const stats = computeKindStats(k, c.level)
      return {
        slot: c.slot,
        name: k?.name || (c as any)?.kind || c.slot,
        tier: k?.tier,
        level: c.level,
        contributions: stats,
      }
    })
  }, [components, catalogKinds])

  const componentBonuses = React.useMemo(() => {
    const acc: Record<string, number> = {}
    for (const it of componentBreakdown) {
      for (const [k, v] of Object.entries(it.contributions)) acc[k] = (acc[k] || 0) + Number(v || 0)
    }
    return acc
  }, [componentBreakdown])

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fleet & Crew</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full h-auto flex-wrap justify-between gap-2">
          <TabsTrigger className="basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-1" value="current">Current Ship & Hired Crew</TabsTrigger>
          <TabsTrigger className="basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-1" value="staffing">Staffing</TabsTrigger>
          <TabsTrigger className="basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-1" value="available">Available Ships</TabsTrigger>
          <TabsTrigger className="basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-1" value="components">Components</TabsTrigger>
          <TabsTrigger className="basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-1" value="market">Crew Market</TabsTrigger>
          <TabsTrigger className="basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-1" value="alliance">Alliance</TabsTrigger>
        </TabsList>

        <TabsContent value="staffing">
          <StaffingTab
            currentShip={currentShip}
            positionTemplates={positionTemplates}
            assignments={assignments}
            hiredCrew={hiredCrew}
            autoStrategy={autoStrategy}
            setAutoStrategy={setAutoStrategy}
            saveAssignment={saveAssignment}
            autoAssign={autoAssign}
          />
        </TabsContent>

        <TabsContent value="current">
          <>
            <CurrentTab
              profileId={profileId}
              shipLoading={shipLoading}
              ship={ship}
              currentShip={currentShip}
              derivedBonuses={derivedBonuses}
              derivedBreakdown={derivedBreakdown}
              componentBonuses={componentBonuses}
              componentBreakdown={componentBreakdown}
              effectsOpen={false}
              setEffectsOpen={() => { }}
              onDockRepair={onDockRepair}
              resetting={resetting}
              setActiveTab={(t) => setActiveTab(t as any)}
              abandonOpen={false}
              setAbandonOpen={() => { }}
              abandonShip={abandonShip as any}
            />
            <HiredCrewTab
              profileId={profileId}
              hiredLoading={hiredLoading}
              hiredCrew={hiredCrew}
              fireCrew={fireCrew}
              hireCrew={hireCrew}
            />
          </>
        </TabsContent>

        <TabsContent value="available">
          <AvailableShipsTab
            catalogLoading={catalogLoading}
            catalog={catalog}
            currentShip={currentShip}
            selectShip={async (id) => {
              const res = await selectShip(id)
              if (res?.components && Array.isArray(res.components)) setComponents(res.components)
            }}
          />
        </TabsContent>

        <TabsContent value="components">
          <ComponentsTab
            profileId={profileId}
            componentsLoading={componentsLoading}
            components={components}
            currentShip={currentShip}
            installComponents={installComponents}
            missingSlots={missingSlots}
            catalogKinds={catalogKinds as any}
            getDefaultKindForSlot={getDefaultKindForSlot}
            installComponentForSlot={installComponentForSlot}
            replaceOpen={replaceOpen}
            setReplaceOpen={setReplaceOpen}
            prepareUpgradeConfirm={prepareUpgradeConfirm}
            prepareReplaceConfirm={prepareReplaceConfirm}
            confirmUpgrade={confirmUpgrade}
            setConfirmUpgrade={setConfirmUpgrade}
            confirmReplace={confirmReplace}
            setConfirmReplace={setConfirmReplace}
            doUpgrade={doUpgrade}
            doReplace={doReplace}
          />
        </TabsContent>

        <TabsContent value="market">
          <CrewMarketTab
            positionTemplates={positionTemplates}
            marketFilter={marketFilter}
            setMarketFilter={setMarketFilter}
            marketBestFit={marketBestFit}
            setMarketBestFit={setMarketBestFit}
            marketOnlyUncovered={marketOnlyUncovered}
            setMarketOnlyUncovered={setMarketOnlyUncovered}
            marketLoading={marketLoading}
            marketCrew={marketCrew}
            orderedRoles={orderedRoles}
            groupedMarket={groupedMarket}
            hiredCrew={hiredCrew}
            hireCrew={hireCrew}
            profileId={profileId}
            uncoveredNeeds={uncoveredNeeds}
            autoStrategy={autoStrategy}
          />
        </TabsContent>

        <TabsContent value="alliance">
          <AllianceTab {...useFleetAlliance(profileId)} profileId={profileId} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
