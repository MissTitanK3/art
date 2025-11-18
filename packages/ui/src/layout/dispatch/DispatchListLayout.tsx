"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card";
import { humanize } from "@workspace/ui/lib/utils";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch.ts";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import { urgencyEmoji } from "@workspace/ui/lib/messageFormatter";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { DispatchCard } from "./DispatchCard";
import { useDispatchFilterState } from "./useDispatchFilterState";

type LinkWrapperProps = {
  href: string;
  children: React.ReactNode;
};

export type DispatchListLayoutProps = {
  submissions: DispatchSubmission[];
  title?: React.ReactNode;
  getHref?: (submission: DispatchSubmission) => string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  LinkComponent?: React.ComponentType<LinkWrapperProps>;
  enableFilters?: boolean;
  enablePagination?: boolean;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  initialUrlParams?: Record<string, string | undefined>;
  onUrlChange?: (url: string) => void;
  persistKey?: string;
};

const DefaultLinkComponent: React.FC<LinkWrapperProps> = ({
  href,
  children,
}) => (
  <a href={href} className="block hover:no-underline">
    {children}
  </a>
);

export function DispatchListLayout({
  submissions,
  title = <h1 className="text-2xl font-bold">Dispatch List</h1>,
  getHref = (submission) => `/dispatches/submission/${submission.id}`,
  emptyState = (
    <p className="text-sm text-muted-foreground">
      No dispatch submissions yet.
    </p>
  ),
  loadingState,
  LinkComponent = DefaultLinkComponent,
  enableFilters = true,
  enablePagination = true,
  pageSizeOptions = [9, 18, 27],
  initialPageSize,
  initialUrlParams,
  onUrlChange,
  persistKey,
}: DispatchListLayoutProps) {
  const {
    query,
    setQuery,
    debouncedQuery,
    status,
    setStatus,
    type,
    setType,
    dateRange,
    setDateRange,
    clearDateRange,
    resetFilters,
    pageSize,
    setPageSize,
    page,
    setPage,
  } = useDispatchFilterState({
    persistKey,
    initialUrlParams,
    onUrlChange,
    initialPageSize,
    defaultPageSize: pageSizeOptions?.[0] ?? 9,
  });
  const [calendarMonths, setCalendarMonths] = React.useState<number>(2);
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "past">(
    "upcoming",
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setCalendarMonths(window.innerWidth < 640 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // available options from constants (fall back to derivation if needed)
  const options = React.useMemo(() => {
    const statusKeys = Object.keys(STATUS_META);
    const typeKeys = Object.keys(DISPATCH_TYPE_LABELS);
    return {
      statuses:
        statusKeys.length > 0
          ? (statusKeys as string[])
          : Array.from(
            new Set(
              submissions.map((s) => s.status).filter(Boolean) as string[],
            ),
          ).sort(),
      types:
        typeKeys.length > 0
          ? (typeKeys as string[])
          : Array.from(
            new Set(
              submissions.map((s) => s.type).filter(Boolean) as string[],
            ),
          ).sort(),
    };
  }, [submissions]);

  React.useEffect(() => {
    if (status !== "all" && !options.statuses.includes(status)) {
      setStatus("all");
    }
  }, [options.statuses, setStatus, status]);

  React.useEffect(() => {
    if (type !== "all" && !options.types.includes(type)) {
      setType("all");
    }
  }, [options.types, setType, type]);

  // Subset submissions per tab first
  const tabScopedSubmissions = React.useMemo(() => {
    const now = new Date();
    // Include events from the last 24 hours in "upcoming" so they appear as "Immediately"
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (activeTab === "upcoming") {
      return submissions.filter(
        (s) =>
          s.status !== "archived" &&
          s.date_of_event &&
          new Date(s.date_of_event) >= cutoff,
      );
    }
    // past & archived
    return submissions.filter(
      (s) =>
        s.status === "archived" ||
        (s.date_of_event && new Date(s.date_of_event) < cutoff),
    );
  }, [submissions, activeTab]);

  const filtered = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const list = tabScopedSubmissions.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (type !== "all" && s.type !== type) return false;
      // Date filter (applies to both tabs): strictly use date_of_event; exclude items without one when a range is active
      if (dateRange.from || dateRange.to) {
        if (!s.date_of_event) return false;
        const ts = new Date(s.date_of_event).getTime();
        if (Number.isNaN(ts)) return false;
        let fromMs: number | undefined = undefined;
        if (dateRange.from) {
          const f = new Date(dateRange.from);
          const isMidnight =
            f.getHours() === 0 &&
            f.getMinutes() === 0 &&
            f.getSeconds() === 0 &&
            f.getMilliseconds() === 0;
          fromMs = isMidnight ? f.setHours(0, 0, 0, 0) : f.getTime();
        }
        const toMs = dateRange.to
          ? new Date(dateRange.to).setHours(23, 59, 59, 999)
          : undefined;
        if (fromMs !== undefined && ts < fromMs) return false;
        if (toMs !== undefined && ts > toMs) return false;
      }
      if (q.length > 0) {
        const haystack = [
          s.location_label ?? "",
          s.state ?? "",
          s.intended_action_preset ?? "",
          s.intended_action_notes ?? "",
          ...(Array.isArray(s.intended_actions) ? s.intended_actions : []),
          s.type ?? "",
          s.status ?? "",
          s.point_of_contact ?? "",
          s.public_signal_link ?? "",
          s.signal_link ?? "",
          s.id,
        ]
          .join(" \n ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return list;
  }, [tabScopedSubmissions, debouncedQuery, status, type, dateRange]);

  // --- Group by urgency windows based on date_of_event ---
  function diffMs(a: Date, b: Date) {
    return a.getTime() - b.getTime();
  }
  const bucketFor = React.useCallback(
    (
      sub: (typeof submissions)[number],
    ):
      | "Immediately"
      | "Within 30 Minutes"
      | "Within 1 Hour"
      | "Within 2 Hours"
      | "Later Today"
      | "Within A Day"
      | "Within 3 Days"
      | "Within the Week"
      | "Beyond Next Week" => {
      const now = new Date();
      const whenStr = sub.date_of_event ?? sub.timestamp;
      const when = new Date(whenStr);
      if (isNaN(when.getTime())) return "Within the Week"; // fallback bucket

      const ms = diffMs(when, now);
      const mins = ms / (60 * 1000);
      const hours = mins / 60;

      // Boundaries are inclusive of the smaller bucket
      if (mins <= 0) return "Immediately"; // overdue/now
      if (mins <= 30) return "Within 30 Minutes";
      if (hours <= 1) return "Within 1 Hour";
      if (hours <= 2) return "Within 2 Hours";

      // Compute end of today in local time
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);
      if (when <= endOfToday) return "Later Today";

      const endOfTomorrow = new Date(endOfToday);
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
      if (when <= endOfTomorrow) return "Within A Day";

      const endOf3Days = new Date(endOfToday);
      endOf3Days.setDate(endOf3Days.getDate() + 3);
      if (when <= endOf3Days) return "Within 3 Days";

      const endOfWeek = new Date(endOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return when <= endOfWeek ? "Within the Week" : "Beyond Next Week";
    },
    [],
  );

  const grouped = React.useMemo(() => {
    const order = [
      "Immediately",
      "Within 30 Minutes",
      "Within 1 Hour",
      "Within 2 Hours",
      "Later Today",
      "Within A Day",
      "Within 3 Days",
      "Within the Week",
      "Beyond Next Week",
    ] as const;

    const groups: Record<(typeof order)[number], typeof filtered> = {
      Immediately: [],
      "Within 30 Minutes": [],
      "Within 1 Hour": [],
      "Within 2 Hours": [],
      "Later Today": [],
      "Within A Day": [],
      "Within 3 Days": [],
      "Within the Week": [],
      "Beyond Next Week": [],
    };

    for (const s of filtered) {
      const b = bucketFor(s);
      groups[b].push(s);
    }

    // Sort within each group by date_of_event asc (fallback timestamp)
    for (const k of order) {
      groups[k].sort((a, b) => {
        const da = new Date(a.date_of_event ?? a.timestamp).getTime();
        const db = new Date(b.date_of_event ?? b.timestamp).getTime();
        return da - db;
      });
    }

    return { order, groups };
  }, [filtered, bucketFor]);

  // Flatten back to list for pagination after grouping but preserving grouped order
  const groupedFlattened = React.useMemo(() => {
    const out: typeof filtered = [];
    for (const k of grouped.order) {
      out.push(...grouped.groups[k]);
    }
    return out;
  }, [grouped]);
  // For past/archived tab, we use a flat list sorted by most recent event first
  const pastSorted = React.useMemo(() => {
    if (activeTab !== "past") return filtered;
    return [...filtered].sort((a, b) => {
      const da = a.date_of_event
        ? new Date(a.date_of_event).getTime()
        : new Date(a.timestamp).getTime();
      const db = b.date_of_event
        ? new Date(b.date_of_event).getTime()
        : new Date(b.timestamp).getTime();
      return db - da; // desc (recent first)
    });
  }, [filtered, activeTab]);

  const effectiveList =
    activeTab === "upcoming" ? groupedFlattened : pastSorted;
  const total = effectiveList.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = enablePagination
    ? effectiveList.slice(startIndex, endIndex)
    : effectiveList;

  const handleGoTo = (p: number) => {
    setPage(Math.max(1, Math.min(totalPages, p)));
  };

  const renderPaginationNumbers = () => {
    const items: React.ReactNode[] = [];
    const windowSize = 1; // show current ±1
    const addPage = (p: number) =>
      items.push(
        <PaginationItem key={p}>
          <PaginationLink
            isActive={p === currentPage}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleGoTo(p);
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>,
      );

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) addPage(p);
      return items;
    }

    addPage(1);
    if (currentPage - windowSize > 2) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);
    for (let p = start; p <= end; p++) addPage(p);

    if (currentPage + windowSize < totalPages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }
    addPage(totalPages);
    return items;
  };

  const content =
    submissions.length === 0 ? (
      <div className="mt-4">{loadingState ?? emptyState}</div>
    ) : (
      <>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex items-center justify-center gap-3 mt-2">
            <TabsList>
              <TabsTrigger value="upcoming">Now & Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past & Archived</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {enableFilters ? (
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex w-full flex-wrap items-stretch gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location, state, actions..."
                className="w-full sm:max-w-md"
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {options.statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s as keyof typeof STATUS_META]?.label ??
                        humanize(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {options.types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {DISPATCH_TYPE_LABELS[
                        t as keyof typeof DISPATCH_TYPE_LABELS
                      ] ?? humanize(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[220px] justify-start text-left font-normal"
                  >
                    {dateRange.from || dateRange.to
                      ? `${dateRange.from ? dateRange.from.toLocaleDateString() : "…"} – ${dateRange.to ? dateRange.to.toLocaleDateString() : "…"}`
                      : "Date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-[80] max-w-[calc(100vw-2rem)]"
                  align="start"
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 pb-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const now = new Date();
                          setDateRange({ from: now, to: undefined });
                        }}
                      >
                        From now →
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearDateRange}
                      >
                        Clear
                      </Button>
                    </div>
                    <Calendar
                      mode="range"
                      selected={
                        { from: dateRange.from, to: dateRange.to } as any
                      }
                      onSelect={(range: any) =>
                        setDateRange({ from: range?.from, to: range?.to })
                      }
                      numberOfMonths={calendarMonths}
                    />
                    <div className="flex justify-end gap-2 p-2 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDateRange({ from: new Date() })}
                      >
                        From now
                      </Button>
                      <Button size="sm" onClick={() => undefined}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {(query ||
                status !== "all" ||
                type !== "all" ||
                dateRange.from ||
                dateRange.to) && (
                  <Button
                    variant="ghost"
                    onClick={resetFilters}
                  >
                    Clear
                  </Button>
                )}
            </div>

            {enablePagination ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {total > 0
                    ? `Showing ${startIndex + 1}–${endIndex} of ${total}`
                    : "No results"}
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v) || pageSize)}
                >
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "upcoming" ? (
          <div className="mt-4 text-sm text-muted-foreground">
            <Card className="max-w-sm">
              <CardHeader>
                <span className="font-medium">Legend:</span>
              </CardHeader>
              <CardContent className="-mt-6">
                <ul className="list-disc pl-5">
                  <li>🚨🚨🚨 now/overdue</li>
                  <li>🚨🚨 within an hour</li>
                  <li>🚨 within 2 hours</li>
                  <li>⚠️ today–3 days</li>
                  <li>🪴 within the week</li>
                  <li>🌱 beyond next week</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="mt-4 space-y-8">
          {activeTab === "upcoming" ? (
            (() => {
              const pageSet = new Set(pageItems.map((s) => s.id));
              const sections: React.ReactNode[] = [];
              for (const label of grouped.order) {
                const allInGroup = grouped.groups[label];
                const items = allInGroup.filter((s) => pageSet.has(s.id));
                sections.push(
                  <section key={label}>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span>{urgencyEmoji(label)}</span>
                      <span>{label}</span>
                      <span className="text-muted-foreground text-sm">
                        ({items.length})
                      </span>
                    </h2>
                    {items.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((submission) => (
                          <DispatchCard
                            key={submission.id}
                            submission={submission}
                            LinkComponent={LinkComponent}
                            href={getHref(submission)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border p-4 text-sm text-muted-foreground">
                        {allInGroup.length === 0
                          ? "No Dispatches Available"
                          : "No Dispatches in this section on this page"}
                      </div>
                    )}
                  </section>,
                );
              }
              return sections;
            })()
          ) : (
            <section>
              <h2 className="text-lg font-semibold mb-2">Past & Archived</h2>
              {pageItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pageItems.map((submission) => (
                    <DispatchCard
                      key={submission.id}
                      submission={submission}
                      LinkComponent={LinkComponent}
                      href={getHref(submission)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  No past or archived events
                </div>
              )}
            </section>
          )}
        </div>

        {enablePagination && totalPages > 1 ? (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoTo(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {renderPaginationNumbers()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoTo(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </>
    );

  return (
    <section suppressHydrationWarning>
      {title}
      {content}
    </section>
  );
}

export default DispatchListLayout;
