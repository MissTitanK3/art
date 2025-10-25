"use client";

import * as React from "react";
import type { TrustEntry } from "@workspace/store/types/trust.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { Plus, PauseCircle, PlayCircle, Download } from "lucide-react";
import { fakeUUID, humanize } from "@workspace/ui/lib/utils";
import { Callout } from "@workspace/ui/components/academy/Callout";

type Props = {
  initialEntries: TrustEntry[];
  nameById: Record<string, string>;
};

const ROLE_OPTIONS: TrustEntry["signer_role"][] = ["regional_admin", "pod_leader", "trainer"];
const STATUS_OPTIONS: TrustEntry["status"][] = ["active", "inactive"];

export default function TrustClient({ initialEntries, nameById }: Props) {
  const CHECKIN_DAYS = 90; // default check-in cadence for ROT
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [rows, setRows] = React.useState<TrustEntry[]>(() => initialEntries);
  // SSR-stable date formatting and time reference
  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "UTC",
      }),
    []
  );
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
  }, []);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newSubjectId, setNewSubjectId] = React.useState<string>("");
  const [newSignerId, setNewSignerId] = React.useState<string>("");
  const [newRole, setNewRole] = React.useState<TrustEntry["signer_role"]>("pod_leader");

  const filtered = React.useMemo(() => {
    return rows.filter((e) => {
      if (role && e.signer_role !== role) return false;
      if (status && e.status !== status) return false;
      if (query) {
        const subject = nameById[e.subjectId] || e.subjectId;
        const signer = nameById[e.signerId] || e.signerId;
        const hay = [subject, signer, e.signer_rot, e.signed_entry_hash].join("\n").toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, role, status, query, nameById]);

  function addEntry() {
    if (!newSubjectId || !newSignerId) {
      toast.error("Select both Subject and Signer");
      return;
    }
    const entry: TrustEntry = {
      subjectId: newSubjectId,
      signerId: newSignerId,
      signer_role: newRole,
      signer_rot: "demo-rot-fingerprint",
      signed_at: new Date().toISOString(),
      signed_entry_hash: fakeUUID(),
      status: "active",
    };
    setRows((prev) => [entry, ...prev]);
    toast.success("Entry added — demo-only");
    setAddOpen(false);
    setNewSubjectId("");
    setNewSignerId("");
    setNewRole("pod_leader");
  }

  function toggleStatus(idx: number) {
    setRows((prev) => {
      const copy = prev.slice();
      const e = copy[idx];
      if (!e) return prev;
      if (e.status === "inactive") {
        copy[idx] = { ...e, status: "active", signed_at: new Date().toISOString() };
        toast.success("Entry resumed — check-in reset");
      } else {
        copy[idx] = { ...e, status: "inactive" };
        toast.success("Entry deactivated");
      }
      return copy;
    });
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trust-graph.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trust</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
          <Button size="sm" variant="outline" onClick={exportJSON}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card text-card-foreground max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Trust Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Subject</Label>
              <Select value={newSubjectId} onValueChange={(v) => setNewSubjectId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject by name" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(nameById)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Signer</Label>
              <Select value={newSignerId} onValueChange={(v) => setNewSignerId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select signer by name" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(nameById)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Signer Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as TrustEntry["signer_role"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{humanize(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Note: This is a demo-only entry. ROT fingerprint is auto-filled and check-in is calculated from the signed date.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addEntry}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>What Is Trust?</CardTitle>
          <CardDescription>
            A registry of signed endorsements used here to support periodic safety check-ins for key people. Not used for permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Callout type="info">
            Use ROT as a check-in cadence. When a person’s ROT reaches its check-in date and you haven’t heard from them, it cues the regional admin to reach out and ensure they’re safe and secure.
          </Callout>
          <div className="grid gap-3">
            <div>
              <p className="font-medium">Benefits to your region</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Keep regular touchpoints with key roles (regional admin, pod leader, trainer).</li>
                <li>Spot overdue check-ins quickly and reduce risk for isolated responders.</li>
                <li>Maintain an auditable trail of endorsements and follow-ups.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Using this page</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Search and filter by signer role, status, or ROT fingerprint.</li>
                <li>Watch the Check-in column for upcoming or overdue follow-ups.</li>
                <li>If a check-in is Overdue and there’s no recent contact, reach out to confirm safety.</li>
                <li>Export the current view for audits or to share with leadership.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-1">Note: actions here are demo‑only. Production endorsements and check-in cadence are governed by your region.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trust Entries</CardTitle>
          <CardDescription>Filter by signer role or status. Add entries and manage check-in status. Demo-only.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subject, signer, ROT..." className="w-[280px]" />
            <Select value={role || undefined} onValueChange={(v) => setRole(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by signer role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status || undefined} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Signer</TableHead>
                  <TableHead>Signer Role</TableHead>
                  <TableHead>ROT Fingerprint</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e, idx) => (
                  <TableRow key={`${e.signerId}-${e.subjectId}-${e.signed_entry_hash}`}>
                    <TableCell className="max-w-[220px] truncate">{nameById[e.subjectId] || e.subjectId}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{nameById[e.signerId] || e.signerId}</TableCell>
                    <TableCell>{humanize(e.signer_role)}</TableCell>
                    <TableCell className="max-w-[240px] truncate">{e.signer_rot}</TableCell>
                    <TableCell className="whitespace-nowrap">{dateFmt.format(new Date(e.signed_at))}</TableCell>
                    <TableCell suppressHydrationWarning>
                      {now == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (() => {
                        const signedAt = new Date(e.signed_at).getTime();
                        const dueAt = signedAt + CHECKIN_DAYS * 24 * 60 * 60 * 1000;
                        const diffDays = Math.ceil((dueAt - now) / (24 * 60 * 60 * 1000));
                        if (diffDays < 0) {
                          return (
                            <Badge variant="outline" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
                              Overdue {Math.abs(diffDays)}d
                            </Badge>
                          );
                        }
                        if (diffDays <= 14) {
                          return (
                            <Badge variant="outline" className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30">
                              Due in {diffDays}d
                            </Badge>
                          );
                        }
                        return (
                          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                            Due in {diffDays}d
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {e.status === 'active' ? (
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant={e.status === 'active' ? 'destructive' : 'secondary'} onClick={() => toggleStatus(idx)}>
                          {e.status === 'active' ? (
                            <><PauseCircle className="h-4 w-4 mr-2" /> Deactivate</>
                          ) : (
                            <><PlayCircle className="h-4 w-4 mr-2" /> Resume</>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
