"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import { Database, RefreshCcw, Stethoscope, ShieldCheck, Download } from "lucide-react";

type DbHealth = {
  schemaVersion: string;
  postgisOk: boolean;
  geogSyncOk: boolean;
  auditTriggersOk: boolean;
};

export default function DbClient({ initialHealth }: { initialHealth: DbHealth }) {
  const [health, setHealth] = React.useState<DbHealth>(initialHealth);

  function runHeal() {
    toast.success("healDb() executed — demo-only");
  }
  function runVacuum() {
    toast.success("VACUUM ANALYZE queued — demo-only");
  }
  function verifyPostGIS() {
    setHealth((h) => ({ ...h, postgisOk: true, geogSyncOk: true }));
    toast.success("PostGIS checks passed — demo-only");
  }
  function exportAnonymized() {
    const data = {
      version: health.schemaVersion,
      exportedAt: new Date().toISOString(),
      tables: ["profiles", "pods", "dispatch_submissions", "academy_sessions"],
      note: "Demo anonymized export stub. Replace with server export.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `region-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Database Health</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportAnonymized}>
            <Download className="h-4 w-4 mr-2" /> Export Anonymized
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema & Extensions</CardTitle>
          <CardDescription>Verify schema version, PostGIS, and audit triggers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <HealthItem label="Schema Version" value={<span className="font-mono">{health.schemaVersion}</span>} />
            <HealthItem label="PostGIS" value={health.postgisOk ? <Ok /> : <Fail />} />
            <HealthItem label="location_geog sync" value={health.geogSyncOk ? <Ok /> : <Fail />} />
            <HealthItem label="Audit Triggers" value={health.auditTriggersOk ? <Ok /> : <Fail />} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={runHeal}>
              <Stethoscope className="h-4 w-4 mr-2" /> Heal DB
            </Button>
            <Button size="sm" variant="secondary" onClick={runVacuum}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Vacuum/Analyze
            </Button>
            <Button size="sm" variant="outline" onClick={verifyPostGIS}>
              <ShieldCheck className="h-4 w-4 mr-2" /> Verify PostGIS
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit</CardTitle>
          <CardDescription>Recent maintenance operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Placeholder audit events */}
                <TableRow>
                  <TableCell className="whitespace-nowrap">{new Date().toLocaleString()}</TableCell>
                  <TableCell>Startup Check</TableCell>
                  <TableCell className="max-w-[420px] truncate">Schema {health.schemaVersion}; PostGIS {health.postgisOk ? 'OK' : 'Missing'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Ok() {
  return <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">OK</Badge>;
}
function Fail() {
  return <Badge variant="outline" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Fail</Badge>;
}

function HealthItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

