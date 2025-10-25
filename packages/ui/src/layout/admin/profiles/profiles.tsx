"use client";

import * as React from "react";
import type { Profile } from "@workspace/store/types/global.ts";
import { AccessRoles, VerifiedBy, roleLabel, VerifiedByDescriptions } from "@workspace/store/types/roles.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { Download, ShieldCheck, UserCheck, UserX } from "lucide-react";

function AccessRoleBadge({ role }: { role: Profile["access_role"] }) {
  const color = role === "dispatcher_admin" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    : role === "dispatcher_verified" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
      : role === "dispatcher_basic" ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
        : "bg-muted text-foreground/80 border-muted-foreground/20";
  return <Badge variant="outline" className={`${color}`}>{roleLabel(role as any)}</Badge>;
}

function VerifiedBadge({ who }: { who: Profile["verified_by"] }) {
  const color = who === "admin" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    : who === "partner_org" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
      : "bg-muted text-foreground/80 border-muted-foreground/20";
  const label = who === "admin" ? "Verified by Admin" : who === "partner_org" ? "Partner Verified" : "Self";
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
      if (availabilityOnly && !p.availability) return false;
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

  function updateRow(id: string, patch: Partial<Profile>, actionLabel: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    toast.success(`${actionLabel} — demo-only`);
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
                        {p.availability ? (
                          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Suspended</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{p.affiliation ?? ""}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{p.contact_signal ?? ""}</TableCell>
                      <TableCell className="max-w-[160px] truncate">{p.coordination_zone ?? p.city ?? ""}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Select
                            value={p.access_role}
                            onValueChange={(val) => !isUnregistered && updateRow(p.id, { access_role: val as any }, "Role updated")}
                          >
                            <SelectTrigger className="w-[180px]" disabled={isUnregistered} aria-disabled={isUnregistered} title={isUnregistered ? "Register this user to change role" : undefined}>
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

                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isUnregistered}
                            title={isUnregistered ? "Register this user to verify" : undefined}
                            onClick={() => updateRow(p.id, { verified_by: "admin" }, "Verified")}
                          >
                            <UserCheck className="h-4 w-4 mr-2" /> Verify
                          </Button>

                          <Button
                            variant={p.availability ? "destructive" : "secondary"}
                            size="sm"
                            title={isUnregistered ? "Register this user to change availability" : undefined}
                            onClick={() => updateRow(p.id, { availability: !p.availability }, p.availability ? "Suspended" : "Reactivated")}
                          >
                            {p.availability ? (
                              <><UserX className="h-4 w-4 mr-2" /> Suspend</>
                            ) : (
                              <><ShieldCheck className="h-4 w-4 mr-2" /> Activate</>
                            )}
                          </Button>
                        </div>
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
