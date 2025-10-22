"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Terminal, Info, DatabaseZap } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch"
import { DISPATCH_TYPE_LABELS, DispatchStatus } from "@workspace/store/types/dispatch.ts"

import { navConfig } from "@/nav.config"
import { DispatchStoreProvider, useDispatchStore } from "@/providers/DispatchStoreProvider"
import { PodStoreProvider, usePodStore } from "@/providers/PodStoreProvider"

type ViewMode = "info" | "dashboard"

const REGION_IDENTIFIER = String("region-template")
const TEMPLATE_REGION_IDENTIFIER = `region-${"template"}`

export default function Page() {
  const isTemplateRegion = REGION_IDENTIFIER === TEMPLATE_REGION_IDENTIFIER
  const [view, setView] = useState<ViewMode>(isTemplateRegion ? "info" : "dashboard")
  const showToggle = isTemplateRegion
  const brandName = navConfig.brand?.name ?? "ART Region Template"
  const brandHeadline = brandName.replace(/^ART\s+/i, "")

  return (
    <div className="flex min-h-svh w-full flex-col items-center gap-6 px-4 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">🌎 {brandHeadline}</h1>
        <p className="mt-2 max-w-2xl text-balance text-muted-foreground">
          This is a demonstration region for the ART platform—showing how navigation, data layers,
          and coverage dashboards stitch together once you connect a real data source.
        </p>
      </header>

      {showToggle ? (
        <div className="flex justify-center">
          <ViewToggle current={view} onChange={setView} />
        </div>
      ) : null}

      <main className="w-full">
        {view === "info" ? <TemplateInfoContent /> : <DemoDashboard />}
      </main>
    </div>
  )
}

function ViewToggle({ current, onChange }: { current: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-muted p-1">
      <ToggleButton
        label="Template overview"
        active={current === "info"}
        onClick={() => onChange("info")}
      />
      <ToggleButton
        label="Demo dashboard"
        active={current === "dashboard"}
        onClick={() => onChange("dashboard")}
      />
    </div>
  )
}

function ToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "ghost"}
      className={cn("rounded-full px-4", active ? "shadow-sm" : "")}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function TemplateInfoContent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      <Alert variant="destructive" className="w-full">
        <DatabaseZap className="h-4 w-4" />
        <AlertTitle>Demo Mode Active</AlertTitle>
        <AlertDescription className="w-full text-center">
          <div className="m-auto flex flex-col items-center gap-2">
            <span>This instance is running in</span>
            <div className="flex w-full items-center justify-evenly text-sm">
              <Info className="h-4 w-4" />
              <span>
                <strong>demo-only</strong> mode and is
              </span>
              <Info className="h-4 w-4" />
            </div>
            <div className="flex w-full items-center justify-evenly text-sm">
              <Info className="h-4 w-4" />
              <span>
                <strong>not connected to a live database</strong>.
              </span>
              <Info className="h-4 w-4" />
            </div>
            <span>Any actions, changes, or submissions will not be saved.</span>
          </div>
        </AlertDescription>
      </Alert>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>🧱 What Is This Platform?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            This Region Template is part of a decentralized platform designed to support regional
            collaboration, rapid deployment, and secure autonomy. It includes:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>
              <strong>Region-specific routing</strong> and branding via subdomains
            </li>
            <li>
              <strong>Authentication-aware dashboards</strong> for different roles
            </li>
            <li>
              <strong>Supabase (or PocketServer)</strong> integration for storage and permissions
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>🛠️ Region Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ul className="list-inside list-disc space-y-1">
            <li>
              Create a new directory: <code>region-[your-name]</code>
            </li>
            <li>
              Update <code>package.json</code> with the new name
            </li>
            <li>Register your region’s routing path in the global nav</li>
            <li>Confirm DB connection and .env setup before launch</li>
          </ul>

          <Alert variant="default">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              Region names must be <strong>globally unique</strong>. Make sure you coordinate with
              other region admins to avoid duplication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <Button
          type="button"
          onClick={() =>
            toast("You pressed the button!", {
              description: "Welcome to the tools.",
              action: {
                label: "Dismiss",
                onClick: () => {},
              },
            })
          }
        >
          Trigger Toast
        </Button>
      </div>
    </div>
  )
}

function DemoDashboard() {
  return (
    <DispatchStoreProvider persist={false}>
      <PodStoreProvider persist={false}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <DashboardOverviewCards />
          <ResourceCoverageCard />
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <ActiveDispatchesPreview />
            <PodsPreview />
          </div>
        </div>
      </PodStoreProvider>
    </DispatchStoreProvider>
  )
}

function DashboardOverviewCards() {
  const submissions = useDispatchStore((state) => state.submissions)
  const pods = usePodStore((state) => state.pods)
  const roster = usePodStore((state) => state.activeRoster)

  const metrics = useMemo(() => {
    const totalDispatches = submissions.length
    const activeDispatches = submissions.filter((entry) => isActiveStatus(entry.status)).length
    const mobilizing = submissions.filter((entry) => entry.status === "mobilizing").length
    const podsOnline = pods.length
    const rosterReady = roster.filter((entry) => entry.status === "active").length
    const rosterTotal = roster.length
    const totalPodMembers = pods.reduce((sum, pod) => sum + (pod.team?.length ?? 0), 0)
    const languages = new Set<string>()
    roster.forEach((entry) => {
      entry.langs?.forEach((lang) => languages.add(lang.display_name))
    })

    return [
      {
        key: "dispatches",
        label: "Active dispatches",
        value: activeDispatches,
        subtext:
          totalDispatches === 0
            ? "No dispatches in the queue."
            : mobilizing > 0
              ? `${mobilizing} mobilizing right now.`
              : `${totalDispatches} logged in the queue.`,
      },
      {
        key: "pods",
        label: "Pods online",
        value: podsOnline,
        subtext:
          podsOnline === 0
            ? "Create pods to coordinate your teams."
            : `${totalPodMembers} volunteers assigned.`,
      },
      {
        key: "roster",
        label: "Ready volunteers",
        value: rosterReady,
        subtext:
          rosterTotal === 0
            ? "Invite your first volunteers."
            : `${languages.size} languages covered across ${rosterTotal} people.`,
      },
    ]
  }, [pods, roster, submissions])

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{metric.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ResourceCoverageCard() {
  const pods = usePodStore((state) => state.pods)
  const podsById = useMemo(() => new Map(pods.map((pod) => [pod.id, pod])), [pods])
  const shifts = useDispatchStore((state) => state.shifts)

  const { activeShifts, upcomingShifts } = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now.getTime() + 12 * 60 * 60 * 1000)

    const active = []
    const upcoming = []

    for (const shift of shifts) {
      const start = new Date(shift.startsAt)
      const end = new Date(shift.endsAt)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue

      if (start <= now && end >= now) {
        active.push(shift)
        continue
      }

      if (start > now && start <= cutoff) {
        upcoming.push(shift)
      }
    }

    upcoming.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

    return { activeShifts: active, upcomingShifts: upcoming }
  }, [shifts])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coverage window</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <ShiftColumn
          title="Live shifts"
          shifts={activeShifts}
          podsById={podsById}
          emptyCopy="No teams on shift right now."
        />
        <ShiftColumn
          title="Next 12 hours"
          shifts={upcomingShifts}
          podsById={podsById}
          emptyCopy="No coverage scheduled yet."
        />
      </CardContent>
    </Card>
  )
}

type ShiftPreview = {
  id: string
  podId?: string
  startsAt: string
  endsAt: string
  notes?: string
  volunteerName?: string
}

function ShiftColumn({
  title,
  shifts,
  podsById,
  emptyCopy,
}: {
  title: string
  shifts: ShiftPreview[]
  podsById: Map<string, { name: string; area?: string }>
  emptyCopy: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">Pulled from the dispatch roster demo data layer.</p>
      </div>
      {shifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyCopy}</p>
      ) : (
        shifts.slice(0, 3).map((shift) => {
          const pod = shift.podId ? podsById.get(shift.podId) : undefined
          return (
            <div
              key={shift.id}
              className="rounded-md border border-border/60 bg-muted/40 p-3 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{pod?.name ?? "Unassigned pod"}</span>
                <span>{formatRelativeTime(shift.startsAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{formatTimeRange(shift.startsAt, shift.endsAt)}</p>
              {pod?.area ? (
                <p className="text-xs text-muted-foreground">{pod.area}</p>
              ) : null}
              {shift.notes ? (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{shift.notes}</p>
              ) : null}
            </div>
          )
        })
      )}
    </div>
  )
}

function ActiveDispatchesPreview() {
  const submissions = useDispatchStore((state) => state.submissions)

  const items = useMemo(
    () =>
      [...submissions]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4),
    [submissions],
  )

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Dispatch queue</CardTitle>
          <p className="text-sm text-muted-foreground">Latest entries flowing through the queue.</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dispatches">Open dispatch</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No dispatches yet. Connect a data source or submit a demo intake to populate this view.
          </p>
        ) : (
          items.map((submission) => {
            const statusMeta = STATUS_META[submission.status]
            const typeLabel = DISPATCH_TYPE_LABELS[submission.type ?? "other"]
            const requiredRoles = submission.required_roles ?? []
            const rolePreview = requiredRoles.slice(0, 3).join(", ")
            const hasMoreRoles = requiredRoles.length > 3

            return (
              <div
                key={submission.id}
                className="rounded-md border border-border/60 bg-muted/40 p-4 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="border-none bg-background/60 px-2 py-1 text-xs">
                      {typeLabel}
                    </Badge>
                    <span>{formatRelativeTime(submission.timestamp)}</span>
                  </div>
                  <Badge
                    className={cn(
                      "border-none px-2 py-1 text-xs font-semibold capitalize text-white",
                      statusMeta?.color ?? "bg-slate-600",
                    )}
                  >
                    {statusMeta?.label ?? submission.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-medium">
                  {submission.location_label ?? "Unlabeled dispatch"}
                </p>
                {submission.intended_action_notes ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {submission.intended_action_notes}
                  </p>
                ) : null}
                {rolePreview ? (
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Needs: {rolePreview}
                    {hasMoreRoles ? "…" : ""}
                  </p>
                ) : null}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function PodsPreview() {
  const pods = usePodStore((state) => state.pods)
  const snippets = useMemo(() => pods.slice(0, 4), [pods])
  const totalRoster = pods.reduce((sum, pod) => sum + (pod.team?.length ?? 0), 0)

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Pods at a glance</CardTitle>
          <p className="text-sm text-muted-foreground">
            {pods.length === 0
              ? "Pods sync once you connect to your real data layer."
              : `${totalRoster} volunteers across ${pods.length} pods.`}
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/pods">Pods directory</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {snippets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pods yet. Use the pods tools to add your first coverage team.
          </p>
        ) : (
          snippets.map((pod) => (
            <div
              key={pod.id}
              className="rounded-md border border-border/60 bg-muted/40 p-4 shadow-xs"
            >
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{pod.name}</span>
                <Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
                  {(pod.team?.length ?? 0).toString()} members
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{pod.area}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(pod.channels ?? []).slice(0, 3).map((channel) => (
                  <Badge key={`${pod.id}-${channel.type}`} variant="outline" className="text-xs">
                    {channel.type}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function isActiveStatus(status: DispatchStatus) {
  return !["completed", "cancelled", "expired", "archived"].includes(status)
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown time"

  const diffMs = date.getTime() - Date.now()
  const isFuture = diffMs > 0
  const absoluteMinutes = Math.round(Math.abs(diffMs) / 60000)

  if (absoluteMinutes < 1) {
    return isFuture ? "starting now" : "just now"
  }

  if (absoluteMinutes < 60) {
    return isFuture
      ? `in ${absoluteMinutes} min${absoluteMinutes === 1 ? "" : "s"}`
      : `${absoluteMinutes} min${absoluteMinutes === 1 ? "" : "s"} ago`
  }

  const absoluteHours = Math.round(absoluteMinutes / 60)
  if (absoluteHours < 24) {
    return isFuture
      ? `in ${absoluteHours} hr${absoluteHours === 1 ? "" : "s"}`
      : `${absoluteHours} hr${absoluteHours === 1 ? "" : "s"} ago`
  }

  const absoluteDays = Math.round(absoluteHours / 24)
  return isFuture
    ? `in ${absoluteDays} day${absoluteDays === 1 ? "" : "s"}`
    : `${absoluteDays} day${absoluteDays === 1 ? "" : "s"} ago`
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Unscheduled"
  }

  const sameDay = startDate.toDateString() === endDate.toDateString()
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  if (sameDay) {
    return `${dateFormatter.format(startDate)} • ${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`
  }

  return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} – ${dateFormatter.format(endDate)} ${timeFormatter.format(endDate)}`
}
