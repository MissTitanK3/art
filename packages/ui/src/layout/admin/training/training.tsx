"use client";

import * as React from "react";
import type { AcademyTrainingSession } from "@workspace/store/types/academy.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
 

type Props = {
  initialSessions: AcademyTrainingSession[];
};

const STATUS_OPTIONS: AcademyTrainingSession["status"][] = [
  "scheduled",
  "in_progress",
  "completed",
  "archived",
];

const MODALITY_OPTIONS: AcademyTrainingSession["modality"][] = [
  "online",
  "in_person",
  "hybrid",
];

export default function TrainingClient({ initialSessions }: Props) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const [modality, setModality] = React.useState<string>("");
  const [rows, setRows] = React.useState<AcademyTrainingSession[]>(() => initialSessions);

  const filtered = React.useMemo(() => {
    return rows.filter((s) => {
      if (status && s.status !== status) return false;
      if (modality && s.modality !== modality) return false;
      if (query) {
        const hay = [s.title, s.location ?? "", s.instructorName, s.relatedTopic ?? ""].join("\n").toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, status, modality, query]);

  

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Training</h1>
        <div className="text-sm text-muted-foreground">View-only. Manage sessions in Academy.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes and Sessions</CardTitle>
          <CardDescription>Filter by status or modality.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, instructor, topic..." className="w-[280px]" />
            <Select value={status || undefined} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={modality || undefined} onValueChange={(v) => setModality(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by modality" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modalities</SelectItem>
                {MODALITY_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(s.start).toLocaleString()} → {new Date(s.end).toLocaleString()}</TableCell>
                    <TableCell>{s.modality}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{s.instructorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.seats.confirmed}/{s.seats.capacity} confirmed</Badge>
                      {s.seats.waitlist ? (
                        <Badge variant="outline" className="ml-2">{s.seats.waitlist} waitlist</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {s.status === 'completed' ? (
                        <Badge variant="outline">Completed</Badge>
                      ) : s.status === 'in_progress' ? (
                        <Badge variant="outline">In Progress</Badge>
                      ) : s.status === 'scheduled' ? (
                        <Badge variant="outline">Scheduled</Badge>
                      ) : (
                        <Badge variant="outline">Archived</Badge>
                      )}
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
