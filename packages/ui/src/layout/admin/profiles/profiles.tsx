"use client";

import * as React from "react";
import type { Profile } from "@workspace/store/types/global.ts";
import { AccessRoles, VerifiedBy, roleLabel, VerifiedByDescriptions } from "@workspace/store/types/roles.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Switch } from "@workspace/ui/components/switch";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { Download, ShieldCheck, UserCheck, UserX, MoreVertical } from "lucide-react";
import { safeErrorMessage } from "@workspace/ui/lib/http";

function AccessRoleBadge({ role }: { role: Profile["access_role"] }) {
  // Distinct badge colors for all supported access roles
  const color =
    role === "team_member"
      ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30"
      : role === "pod_leader"
        ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
        : role === "trainer"
          ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
          : role === "dispatcher_basic"
            ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
            : role === "dispatcher_verified"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
              : role === "dispatcher_admin"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : role === "admin"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : role === "regional_admin"
                    ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                    : role === "national_admin"
                      ? "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30"
                      : "bg-muted text-foreground/80 border-muted-foreground/20";
  return <Badge variant="outline" className={`${color}`}>{roleLabel(role as any)}</Badge>;
}

function VerifiedBadge({ who }: { who: Profile["verified_by"] }) {
  const color = who === "admin"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    : who === "partner_org"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
      : who === "suspended"
        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
        : "bg-muted text-foreground/80 border-muted-foreground/20";
  const label = who === "admin"
    ? "Verified by Admin"
    : who === "partner_org"
      ? "Partner Verified"
      : who === "suspended"
        ? "Suspended"
        : "Self";
  return <Badge variant="outline" className={`${color}`}>{label}</Badge>;
}

type Props = {
  initialProfiles: Profile[];
};

export default function ProfilesClient({ initialProfiles }: Props) {
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("");
  const [verifierFilter, setVerifierFilter] = React.useState<string>("");
  const [availabilityOnly, setAvailabilityOnly] = React.useState(false);
  const [rows, setRows] = React.useState<Profile[]>(() => initialProfiles);

  const filtered = React.useMemo(() => {
    return rows.filter((p) => {
      if (roleFilter && p.access_role !== roleFilter) return false;
      if (verifierFilter && p.verified_by !== verifierFilter) return false;
      // Treat suspended state as not available for filtering purposes
      if (availabilityOnly && (p.state === 'suspended')) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = [
          p.display_name,
          p.affiliation ?? "",
          p.contact_signal ?? "",
          p.coordination_zone ?? "",
          p.city ?? "",
          p.access_role,
          p.verified_by,
        ]
          .join("\n")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, roleFilter, verifierFilter, availabilityOnly]);

  async function apiUpdate(id: string, patch: Partial<Profile>, successLabel: string) {
    try {
      const res = await fetch(`/api/admin/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const msg = await safeErrorMessage(res);
        throw new Error(msg);
      }
      const json = (await res.json()) as { profile?: Profile | null };
      const updated = json.profile ?? null;
      if (updated) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      } else {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      }
      toast.success(successLabel);
    } catch (e: any) {
      toast.error(e?.message ?? 'Update failed');
    }
  }

  function exportJSON() {
    const data = filtered.map(redactSensitive);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `profiles-export.json`);
  }

  function exportCSV() {
    const fields = [
      "id",
      "display_name",
      "access_role",
      "verified_by",
      "availability",
      "affiliation",
      "contact_signal",
      "coordination_zone",
      "city",
    ] as const;
    const header = fields.join(",");
    const lines = filtered.map((p) => fields.map((f) => csvEscape(String((p as any)[f] ?? ""))).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `profiles-export.csv`);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profiles</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON}>
            <Download className="h-4 w-4 mr-2" /> JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage users, roles, and verification</CardTitle>
          <CardDescription>Filter by role, verification, and availability. Actions are demo-only.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, affiliation, Signal, zone..."
              className="w-[280px]"
            />
            <Select value={roleFilter || undefined} onValueChange={(v) => setRoleFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {AccessRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabel(r as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={verifierFilter || undefined} onValueChange={(v) => setVerifierFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by verification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {VerifiedBy.map((v) => (
                  <SelectItem key={v} value={v}>
                    {VerifiedByDescriptions[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={availabilityOnly} onCheckedChange={setAvailabilityOnly} id="avail" />
              <label htmlFor="avail" className="text-sm text-muted-foreground">Available only</label>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Affiliation</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const isUnregistered = !p.user_id;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{p.display_name}</span>
                          {!p.user_id ? (
                            <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                              Unregistered
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell><AccessRoleBadge role={p.access_role} /></TableCell>
                      <TableCell><VerifiedBadge who={p.verified_by} /></TableCell>
                      <TableCell>
                        {p.state === 'suspended' ? (
                          <Badge variant="outline" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Suspended</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{p.affiliation ?? ""}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{p.contact_signal ?? ""}</TableCell>
                      <TableCell className="max-w-[160px] truncate">{p.coordination_zone ?? p.city ?? ""}</TableCell>
                      <TableCell className="text-right">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4 mr-2" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-80 p-3">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Role</div>
                                <Select
                                  value={p.access_role}
                                  onValueChange={(val) => {
                                    if (isUnregistered) return;
                                    apiUpdate(p.id, { access_role: val as any }, 'Role updated');
                                  }}
                                >
                                  <SelectTrigger className="w-full" disabled={isUnregistered} aria-disabled={isUnregistered} title={isUnregistered ? "Register this user to change role" : undefined}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent align="end">
                                    {AccessRoles.map((r) => (
                                      <SelectItem key={r} value={r}>
                                        {roleLabel(r as any)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Coordination zone</div>
                                <form
                                  className="grid grid-cols-1 gap-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (isUnregistered) return;
                                    const fd = new FormData(e.currentTarget);
                                    const value = String(fd.get('coordination_zone') ?? '').trim();
                                    apiUpdate(
                                      p.id,
                                      { coordination_zone: value } as any,
                                      value ? 'Zone updated' : 'Zone cleared'
                                    );
                                  }}
                                >
                                  <Input
                                    name="coordination_zone"
                                    placeholder="e.g. sector-001"
                                    defaultValue={p.coordination_zone ?? ''}
                                    disabled={isUnregistered}
                                    title={isUnregistered ? 'Register this user to change zone' : undefined}
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button type="submit" size="sm" disabled={isUnregistered}>
                                      Save
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={isUnregistered}
                                      title={isUnregistered ? 'Register this user to change zone' : undefined}
                                      onClick={() => apiUpdate(p.id, { coordination_zone: '' } as any, 'Zone cleared')}
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                </form>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={isUnregistered}
                                  title={isUnregistered ? "Register this user to verify" : undefined}
                                  onClick={() => apiUpdate(p.id, { verified_by: 'admin' } as any, 'Verified by admin')}
                                >
                                  <ShieldCheck className="h-4 w-4 mr-2" /> Admin verify
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={isUnregistered}
                                  title={isUnregistered ? "Register this user to verify" : undefined}
                                  onClick={() => apiUpdate(p.id, { verified_by: 'partner_org' } as any, 'Verified by partner org')}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" /> Partner verify
                                </Button>

                                <Button
                                  variant={p.verified_by === 'suspended' ? 'secondary' : 'destructive'}
                                  size="sm"
                                  title={isUnregistered ? "Register this user to change verification" : undefined}
                                  onClick={() => {
                                    if (isUnregistered) return;
                                    const next = p.verified_by === 'suspended' ? 'self' : 'suspended';
                                    apiUpdate(p.id, { verified_by: next as any }, next === 'suspended' ? 'Suspended' : 'Reactivated');
                                  }}
                                >
                                  {p.verified_by === 'suspended' ? (
                                    <><ShieldCheck className="h-4 w-4 mr-2" /> Activate</>
                                  ) : (
                                    <><UserX className="h-4 w-4 mr-2" /> Suspend</>
                                  )}
                                </Button>

                                <Button
                                  variant={p.verified_by === 'suspended' ? 'secondary' : 'outline'}
                                  size="sm"
                                  disabled={isUnregistered}
                                  title={isUnregistered ? "Register this user to change verification" : undefined}
                                  onClick={() => {
                                    if (isUnregistered) return;
                                    const next = p.verified_by === 'suspended' ? 'self' : 'suspended';
                                    apiUpdate(p.id, { verified_by: next as any }, next === 'suspended' ? 'Marked suspended' : 'Marked self-verified');
                                  }}
                                >
                                  {p.verified_by === 'suspended' ? (
                                    <><ShieldCheck className="h-4 w-4 mr-2" /> Unsuspend (verify self)</>
                                  ) : (
                                    <><UserX className="h-4 w-4 mr-2" /> Mark suspended</>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function redactSensitive<T extends object>(obj: T): T {
  // No sensitive fields on Profile right now, but keep hook for future additions.
  const clone: any = { ...(obj as any) };
  // Example redaction: delete clone.encrypted_payload
  delete clone.encrypted_payload;
  return clone as T;
}

// moved to @workspace/ui/lib/http
