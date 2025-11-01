"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import DonutChart from "@workspace/ui/components/charts/DonutChart";
import StatCard from "@workspace/ui/components/stat-card";
import NavTile from "@workspace/ui/components/nav-tile";
import KeyValueItem from "@workspace/ui/components/key-value-item";
import { percent } from "@workspace/ui/lib/utils";
import { toWatchReports } from "@workspace/ui/lib/adapters/dispatch-to-watch";
import { FileChartLine, MapPin, Settings, ShieldCheck, Users2, Users, Package, GraduationCap, Handshake, Database, Bug } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { toast } from "sonner";
import { Switch } from "@workspace/ui/components/switch";
import { AccessRoles, roleLabel } from "@workspace/store/types/roles";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ChevronDown, X } from "lucide-react";

import type { WizardReport } from "@workspace/store/types/watch.ts";
import { useRouter } from "next/navigation";
import { DispatchSubmission } from "@workspace/store/types/global";
import { Pod, RosterEntry } from "@workspace/store/types/pod";
import { AcademyTrainingSession } from "@workspace/store/types/academy";
import type { Profile } from "@workspace/store/types/global.ts";

// Map component (client-only)
const WatchMap = dynamic(() => import("@workspace/ui/components/client/watch/WatchMap"), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  // Aggregated metrics from demo data
  const [uniqueProfiles, setUniqueProfiles] = React.useState<number>(0);
  const [uniquePods, setUniquePods] = React.useState<number>(0);
  const [dispatches, setDispatches] = React.useState<DispatchSubmission[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch("/api/admin/profiles", {
          credentials: "include",
          signal: controller.signal,
        });

        const podsRes = await fetch("/api/admin/pods", {
          credentials: "include",
          signal: controller.signal,
        });

        const dispatchesRes = await fetch("/api/admin/dispatches", {
          credentials: "include",
          signal: controller.signal,
        });

        if (!podsRes.ok) throw new Error(`HTTP ${podsRes.status}`);
        const { pods } = (await podsRes.json()) as { pods?: Pod[] };
        const podSize = Array.isArray(pods) ? new Set(pods.map((p) => p.id)).size : 0;
        setUniquePods((prev) => (prev === podSize ? prev : podSize));

        if (!dispatchesRes.ok) throw new Error(`HTTP ${dispatchesRes.status}`);
        const { submissions } = (await dispatchesRes.json()) as { submissions?: DispatchSubmission[] };
        setDispatches(Array.isArray(submissions) ? submissions : []);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { profiles } = (await res.json()) as { profiles?: Profile[] };
        const size = Array.isArray(profiles) ? new Set(profiles.map((p) => p.id)).size : 0;
        setUniqueProfiles((prev) => (prev === size ? prev : size));
      } catch (err) {
        // ignore abort errors; keep zero on other errors
        if ((err as any)?.name === "AbortError") return;
        setUniqueProfiles((prev) => (prev === 0 ? prev : 0));
      }
    };
    load();
    return () => {
      controller.abort();
    };
  }, []);

  const activeDispatches = React.useMemo(
    () => dispatches.filter((d) => !["archived", "completed", "cancelled", "expired"].includes(d.status)).length,
    [dispatches],
  );

  const [trainingStats, setTrainingStats] = React.useState<{ totalActive: number; completed: number; inProgress: number; scheduled: number; completionPct: number }>({ totalActive: 0, completed: 0, inProgress: 0, scheduled: 0, completionPct: 0 });

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/admin/academy/stats', { credentials: 'include', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { stats } = await res.json();
        if (stats) setTrainingStats(stats);
      } catch (e) {
        // ignore
      }
    })();
    return () => controller.abort();
  }, []);

  const trainingPct = trainingStats.completionPct;

  // Adapt dispatch submissions to WatchMap's WizardReport for the map view
  const { reports, idMap } = React.useMemo(() => toWatchReports(dispatches), [dispatches]);

  const handleView = (r: WizardReport) => {
    const id = idMap[r.id];
    if (id) router.push(`/dispatches/submission/${id}`);
  };

  const remaining = Math.max(0, trainingStats.totalActive - trainingStats.completed);
  const chartData = [
    { name: "Completed", value: trainingStats.completed },
    { name: "Remaining", value: remaining },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Regional Admin</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/admin/settings" className="inline-flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </a>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Profiles" value={uniqueProfiles} icon={<Users2 className="h-4 w-4 text-muted-foreground" />} />
        <StatCard
          label="Active Dispatches"
          value={activeDispatches}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard label="Pods" value={uniquePods} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} />
        <StatCard label="Training Completed" value={`${trainingPct}%`} icon={<FileChartLine className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* Quick navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Sections</CardTitle>
          <CardDescription>Jump into a specific management area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <NavTile href="/admin/profiles" icon={<Users className="h-5 w-5" />} label="Profiles" description="Manage users, roles, verification" />
            <NavTile href="/admin/pods" icon={<Package className="h-5 w-5" />} label="Pods" description="Organize pods and rosters" />
            <NavTile href="/admin/dispatch" icon={<MapPin className="h-5 w-5" />} label="Dispatch" description="Review and audit dispatches" />
            <NavTile href="/admin/training" icon={<GraduationCap className="h-5 w-5" />} label="Training" description="Classes, sessions, participants" />
            <NavTile href="/admin/trust" icon={<Handshake className="h-5 w-5" />} label="Trust" description="Manage trust signatures" />
            <NavTile href="/admin/bug-reports" icon={<Bug className="h-5 w-5" />} label="Bug Reports" description="User-submitted platform issues" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Send standard or custom notifications to your region</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="secondary"
              onClick={() => sendNotification({ template: 'maintenance' })}
            >
              System Maintenance
            </Button>
            <Button
              variant="secondary"
              onClick={() => sendNotification({ template: 'dispatch_surge' })}
            >
              Dispatch Surge
            </Button>
            <Button
              variant="secondary"
              onClick={() => sendNotification({ template: 'academy_reminder' })}
            >
              Academy Reminder
            </Button>
            <Button
              variant="secondary"
              onClick={() => sendNotification({ template: 'welcome' })}
            >
              Welcome Message
            </Button>
          </div>

          <hr className="my-2" />

          <CustomNotificationForm onSend={sendNotification} />
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Active Dispatches (Map)</CardTitle>
            <CardDescription>Spatial view of recent dispatch activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] overflow-hidden">
              <WatchMap
                reports={reports}
                className="h-full lg:h-full"
                actionMode="view"
                onViewDispatch={handleView}
                zoom={4}
                center={[39.8283, -99.5795]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>
              {trainingStats.completed} completed of {trainingStats.totalActive} active sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              id="training-progress"
              className="w-full h-[280px] aspect-auto"
              data={chartData}
              config={{
                // Use standard colors (hex/HSL/RGB)
                Completed: { label: "Completed", color: "#10b981" }, // emerald-500
                Remaining: { label: "Remaining", color: "#3b82f6" }, // blue-500
              }}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              showLabels
              showLegend
            />

            <div className="mt-4 text-sm text-muted-foreground">Percentage completed is across non-archived sessions.</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

type SendArgs = {
  template?: 'maintenance' | 'dispatch_surge' | 'academy_reminder' | 'welcome';
  title?: string;
  body?: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  channel?: string;
  link?: string;
  sticky?: boolean;
  ttlMinutes?: number | null;
  recipientUserIds?: string[];
  roles?: string[];
  groups?: ('dispatchers' | 'admins' | 'leaders')[];
};

async function sendNotification(args: SendArgs) {
  try {
    const res = await fetch('/api/admin/notifications/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { id, recipientsCount } = await res.json();
    const suffix = typeof recipientsCount === 'number' ? ` • ${recipientsCount} recipient${recipientsCount === 1 ? '' : 's'}` : '';
    toast.success('Notification sent', { description: `${id ? `id: ${id}` : ''}${suffix}`.trim() });
  } catch (e: any) {
    toast.error('Failed to send notification', { description: e?.message ?? String(e) });
  }
}

function CustomNotificationForm({ onSend }: { onSend: (args: SendArgs) => void }) {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [level, setLevel] = React.useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [channel, setChannel] = React.useState('dispatch');
  const [link, setLink] = React.useState('');
  const [sticky, setSticky] = React.useState(false);
  const [ttlMinutes, setTtlMinutes] = React.useState<number | ''>('');
  const [recipientText, setRecipientText] = React.useState('');
  const [roleGroups, setRoleGroups] = React.useState<{ dispatchers: boolean; admins: boolean; leaders: boolean }>({ dispatchers: false, admins: false, leaders: false });
  const [roleChecks, setRoleChecks] = React.useState<Record<string, boolean>>({});

  // Derived selection array from roleChecks for the multiselect component
  const selectedRoles = React.useMemo(() => AccessRoles.filter((r) => roleChecks[r]), [roleChecks]);

  // Helper: build roleChecks map from a list of roles
  const setChecksFor = React.useCallback((roles: string[]) => {
    const map: Record<string, boolean> = {};
    AccessRoles.forEach((r) => {
      map[r] = roles.includes(r);
    });
    setRoleChecks(map);
  }, []);

  // Apply handy presets for common recipient targets
  const applyPreset = (preset: 'verified_dispatchers' | 'all_dispatchers' | 'admins_only' | 'leaders_trainers' | 'trainers_only' | 'clear') => {
    switch (preset) {
      case 'verified_dispatchers': {
        setRoleGroups({ dispatchers: false, admins: false, leaders: false });
        setChecksFor(['dispatcher_verified']);
        break;
      }
      case 'all_dispatchers': {
        // Use group for all dispatchers (lets server include basic/verified/admin)
        setRoleGroups({ dispatchers: true, admins: false, leaders: false });
        setChecksFor(['dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin']);
        break;
      }
      case 'admins_only': {
        setRoleGroups({ dispatchers: false, admins: true, leaders: false });
        setChecksFor(['admin', 'regional_admin', 'national_admin']);
        break;
      }
      case 'leaders_trainers': {
        setRoleGroups({ dispatchers: false, admins: false, leaders: true });
        setChecksFor(['pod_leader', 'trainer']);
        break;
      }
      case 'trainers_only': {
        setRoleGroups({ dispatchers: false, admins: false, leaders: false });
        setChecksFor(['trainer']);
        break;
      }
      case 'clear': {
        setRoleGroups({ dispatchers: false, admins: false, leaders: false });
        setRoleChecks({});
        setRecipientText('');
        break;
      }
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = recipientText
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const roles = AccessRoles.filter((r) => roleChecks[r]).map((r) => r);
    const groups = (Object.entries(roleGroups).filter(([, v]) => v).map(([k]) => k)) as any;
    onSend({
      title: title || undefined,
      body: body || undefined,
      level,
      channel: channel || undefined,
      link: link || undefined,
      sticky,
      ttlMinutes: ttlMinutes === '' ? null : Number(ttlMinutes),
      recipientUserIds: ids.length ? ids : undefined,
      roles: roles.length ? roles : undefined,
      groups: groups.length ? groups : undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Row 1: Level + Channel */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between align-baseline">

        <div className="flex gap-3 flex-col md:flex-row md:items-end">
          <div>
            <label className="text-sm font-medium">Level</label>
            <Select value={level} onValueChange={(v) => setLevel(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="info" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Channel</label>
            <Select value={channel} onValueChange={(v) => setChannel(v)}>
              <SelectTrigger>
                <SelectValue placeholder="system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="dispatch">Dispatch</SelectItem>
                <SelectItem value="academy">Academy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: TTL + Sticky toggle */}

      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quick presets</label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset('verified_dispatchers')}>Verified Dispatchers only</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset('all_dispatchers')}>All Dispatchers</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset('admins_only')}>Admins only</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset('leaders_trainers')}>Leaders/Trainers</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset('trainers_only')}>Trainers only</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => applyPreset('clear')}>Clear</Button>
        </div>
      </div>

      {/* Recipients: role groups and specific roles */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Recipients</label>
        {/* Multiselect combobox for specific access roles */}
        <AccessRoleMultiSelect
          value={selectedRoles}
          onChange={(vals) => {
            // sync back to roleChecks record
            const next: Record<string, boolean> = {};
            AccessRoles.forEach((r) => {
              next[r] = vals.includes(r);
            });
            setRoleChecks(next);
          }}
        />
      </div>

      <div className="flex gap-3 flex-col md:flex-row md:items-end">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm font-medium">TTL (minutes)</label>
            <div className="flex items-center gap-2">

              <label htmlFor="sticky" className="text-sm">Sticky (no TTL)</label>
              <Switch id="sticky" checked={sticky} onCheckedChange={setSticky} />
            </div>
          </div>
          <Input
            type="number"
            min={0}
            className="mt-3"
            placeholder="60"
            disabled={sticky}
            value={ttlMinutes}
            onChange={(e) => setTtlMinutes(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            How long this notification stays visible before auto-expiring. Leave blank or set to 0 for no auto-expiry. If
            "Sticky" is enabled, TTL is ignored.
          </p>
        </div>
        <div className="flex items-end">
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Body</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Message body" />
      </div>
      <div>
        <label className="text-sm font-medium">Link (optional)</label>
        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Send Custom Notification</Button>
      </div>
    </form>
  );
}

function AccessRoleMultiSelect({
  value,
  onChange,
  placeholder = "Select specific roles…",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const toggle = (role: string) => {
    if (value.includes(role)) {
      onChange(value.filter((r) => r !== role));
    } else {
      onChange([...value, role]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="w-full max-w-xl">
      <label className="text-sm text-muted-foreground">Specific roles</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="w-full mt-1 inline-flex items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm shadow-sm hover:bg-accent/20 focus:outline-none">
            <span className="flex flex-wrap gap-1">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                value.map((r) => (
                  <Badge key={r} variant="secondary" className="flex items-center gap-1">
                    {roleLabel(r as any)}
                    <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggle(r); }} />
                  </Badge>
                ))
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search roles…" />
            <CommandList>
              <CommandEmpty>No roles found.</CommandEmpty>
              <CommandGroup heading="Access roles">
                {AccessRoles.map((r) => {
                  const checked = value.includes(r);
                  return (
                    <CommandItem key={r} value={roleLabel(r as any)} onSelect={() => toggle(r)} className="flex items-center gap-2">
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span>{roleLabel(r as any)}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{value.length} selected</span>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="mt-1 text-xs text-muted-foreground">Use the presets or pick specific roles. Leave empty to not restrict by specific roles.</p>
    </div>
  );
}
