"use client";
import { useMemo, useState } from "react";
import type { AcademyTrainingSession } from "@workspace/store/types/academy.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Input } from "@workspace/ui/primitives/input";
import {
  SortableTable,
  useSortableData,
  type Column,
} from "@workspace/ui/patterns/common/sortable-table";

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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [modality, setModality] = useState<string>("");
  const [rows] = useState<AcademyTrainingSession[]>(() => initialSessions);

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      if (status && s.status !== status) return false;
      if (modality && s.modality !== modality) return false;
      if (query) {
        const hay = [
          s.title,
          s.location ?? "",
          s.instructorName,
          s.relatedTopic ?? "",
        ]
          .join("\n")
          .toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, status, modality, query]);

  const columns = useMemo<Column<AcademyTrainingSession>[]>(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        sortable: true,
        className: "font-medium",
      },
      {
        header: "When",
        id: "when",
        sortable: true,
        accessorFn: (s) => s.start,
        cell: (s) => (
          <span className="whitespace-nowrap">
            {new Date(s.start).toLocaleString()} →{" "}
            {new Date(s.end).toLocaleString()}
          </span>
        ),
      },
      {
        header: "Modality",
        accessorKey: "modality",
        sortable: true,
      },
      {
        header: "Instructor",
        accessorKey: "instructorName",
        sortable: true,
        className: "max-w-[220px] truncate",
      },
      {
        header: "Seats",
        id: "seats",
        cell: (s) => (
          <>
            <Badge variant="outline">
              {s.seats.confirmed}/{s.seats.capacity} confirmed
            </Badge>
            {s.seats.waitlist ? (
              <Badge variant="outline" className="ml-2">
                {s.seats.waitlist} waitlist
              </Badge>
            ) : null}
          </>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: (s) =>
          s.status === "completed" ? (
            <Badge variant="outline">Completed</Badge>
          ) : s.status === "in_progress" ? (
            <Badge variant="outline">In Progress</Badge>
          ) : s.status === "scheduled" ? (
            <Badge variant="outline">Scheduled</Badge>
          ) : (
            <Badge variant="outline">Archived</Badge>
          ),
      },
    ],
    [],
  );

  const {
    paginatedData,
    sortConfig,
    toggleSort,
    currentPage,
    totalPages,
    setCurrentPage,
    pageSize,
    setPageSize,
  } = useSortableData(filtered, columns);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Training</h1>
        <div className="text-sm text-muted-foreground">
          View-only. Manage sessions in Academy.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes and Sessions</CardTitle>
          <CardDescription>Filter by status or modality.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, instructor, topic..."
              className="w-[280px]"
            />
            <Select
              value={status || undefined}
              onValueChange={(v) => setStatus(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={modality || undefined}
              onValueChange={(v) => setModality(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by modality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modalities</SelectItem>
                {MODALITY_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SortableTable
            data={paginatedData}
            columns={columns}
            sortConfig={sortConfig}
            onSort={toggleSort}
            keyExtractor={(s) => s.id}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
              pageSize,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
