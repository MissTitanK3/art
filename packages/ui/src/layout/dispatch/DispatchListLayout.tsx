"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { DispatchTypeBadge } from "@workspace/ui/components/client/DispatchTypeBadge";
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

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
  // URL + persistence integrations (optional)
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
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  React.useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(h);
  }, [query]);
  const [status, setStatus] = React.useState<string>("all");
  const [type, setType] = React.useState<string>("all");
  // Default to filtering from now into the future
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>(
    () => ({ from: new Date() }),
  );
  const [pageSize, setPageSize] = React.useState<number>(() => {
    if (typeof initialPageSize === "number" && initialPageSize > 0)
      return initialPageSize;
    return pageSizeOptions?.[0] ?? 9;
  });
  const [page, setPage] = React.useState<number>(1);
  const lastQueryRef = React.useRef<string | null>(null);
  const [calendarMonths, setCalendarMonths] = React.useState<number>(2);
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "past">(
    "upcoming",
  );

  // Adjust date range defaults when switching tabs
  React.useEffect(() => {
    if (activeTab === "past") {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      setDateRange({ from: startOfYear, to: undefined });
    } else {
      // upcoming defaults from now
      setDateRange({ from: new Date(), to: undefined });
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setCalendarMonths(window.innerWidth < 640 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const buildQueryString = React.useCallback(() => {
    const params = new URLSearchParams();
    const q = debouncedQuery.trim();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);
    if (dateRange.from)
      params.set("from", dateRange.from.toISOString().slice(0, 10));
    if (dateRange.to) params.set("to", dateRange.to.toISOString().slice(0, 10));
    params.set("size", String(pageSize));
    params.set("page", String(page));
    return params.toString();
  }, [debouncedQuery, status, type, dateRange, pageSize, page]);

  const currentCanonicalQueryString = React.useCallback(() => {
    const src = new URLSearchParams(window.location.search);
    ["_rsc", "__nextDataReq", "next-router-state-tree", "next-url"].forEach(
      (k) => src.delete(k),
    );
    const params = new URLSearchParams();
    const order = [
      "q",
      "status",
      "type",
      "from",
      "to",
      "size",
      "page",
    ] as const;
    for (const key of order) {
      const v = src.get(key);
      if (v && v.length > 0) params.set(key, v);
    }
    return params.toString();
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

  // Initialize from URL query params or localStorage (client-only)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // Load persisted state first
    if (persistKey) {
      try {
        const raw = window.localStorage.getItem(persistKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (typeof saved?.query === "string") setQuery(saved.query);
          if (typeof saved?.status === "string") setStatus(saved.status);
          if (typeof saved?.type === "string") setType(saved.type);
          if (saved?.from || saved?.to) {
            setDateRange({
              from: saved?.from ? new Date(saved.from) : undefined,
              to: saved?.to ? new Date(saved.to) : undefined,
            });
          }
          if (typeof saved?.pageSize === "number") setPageSize(saved.pageSize);
          if (typeof saved?.page === "number") setPage(saved.page);
        }
      } catch {
        /* ignore */
      }
    }

    const sourceParams =
      initialUrlParams ??
      (typeof window !== "undefined"
        ? Object.fromEntries(
            new URLSearchParams(window.location.search).entries(),
          )
        : {});
    const q = sourceParams["q"] ?? "";
    const st = sourceParams["status"] ?? "all";
    const tp = sourceParams["type"] ?? "all";
    const from = sourceParams["from"];
    const to = sourceParams["to"];
    const size = sourceParams["size"];
    const pg = sourceParams["page"];

    setQuery(q);
    setStatus(
      options.statuses.includes(st as string) || st === "all"
        ? (st as string)
        : "all",
    );
    setType(
      options.types.includes(tp as string) || tp === "all"
        ? (tp as string)
        : "all",
    );
    if (from || to) {
      const f = from ? new Date(from) : undefined;
      const t = to ? new Date(to) : undefined;
      setDateRange({
        from: f && !isNaN(f as any) ? f : undefined,
        to: t && !isNaN(t as any) ? t : undefined,
      });
    }
    if (size) {
      const n = Number(size);
      if (!Number.isNaN(n) && n > 0) setPageSize(n);
    }
    if (pg) {
      const n = Number(pg);
      if (!Number.isNaN(n) && n > 0) setPage(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL query params and persistence
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const qs = buildQueryString();
    const currentQs = currentCanonicalQueryString();
    if (qs !== lastQueryRef.current) {
      lastQueryRef.current = qs;
      const newUrl = `${window.location.pathname}?${qs}`;
      const currentCleanUrl = `${window.location.pathname}?${currentQs}`;
      if (qs !== currentQs) {
        if (onUrlChange) onUrlChange(newUrl);
        else window.history.replaceState({}, "", newUrl);
      }
    }

    if (persistKey) {
      try {
        window.localStorage.setItem(
          persistKey,
          JSON.stringify({
            query,
            status,
            type,
            from: dateRange.from ? dateRange.from.toISOString() : undefined,
            to: dateRange.to ? dateRange.to.toISOString() : undefined,
            pageSize,
            page,
          }),
        );
      } catch {
        /* ignore */
      }
    }
  }, [
    buildQueryString,
    currentCanonicalQueryString,
    onUrlChange,
    persistKey,
    query,
    status,
    type,
    dateRange,
    pageSize,
    page,
  ]);

  // Subset submissions per tab first
  const tabScopedSubmissions = React.useMemo(() => {
    const now = new Date();
    if (activeTab === "upcoming") {
      return submissions.filter(
        (s) =>
          s.status !== "archived" &&
          s.date_of_event &&
          new Date(s.date_of_event) >= now,
      );
    }
    // past & archived
    return submissions.filter(
      (s) =>
        s.status === "archived" ||
        (s.date_of_event && new Date(s.date_of_event) < now),
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

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status, type, dateRange, pageSize]);

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
                        onClick={() => setDateRange({})}
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
              {(query || status !== "all" || type !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setType("all");
                    setDateRange({ from: new Date() });
                  }}
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
                          <LinkComponent
                            key={submission.id}
                            href={getHref(submission)}
                          >
                            <Card
                              className="h-full transition hover:shadow-lg hover:ring-2 hover:ring-primary/40 dark:hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]"
                              suppressHydrationWarning
                            >
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                  <span className="truncate min-w-0">
                                    {submission.location_label ??
                                      "Unknown Location"}
                                  </span>
                                  <Badge>{humanize(submission.status)}</Badge>
                                </CardTitle>
                                {submission.state ? (
                                  <CardDescription className="text-xs line-clamp-1">
                                    {submission.type ? (
                                      <DispatchTypeBadge
                                        type={submission.type}
                                      />
                                    ) : null}
                                    {submission.type ? " • " : null}
                                    {submission.state}
                                  </CardDescription>
                                ) : null}
                              </CardHeader>
                              <CardContent className="space-y-3 text-sm">
                                {submission.required_roles_by_type &&
                                Object.keys(submission.required_roles_by_type)
                                  .length > 0 ? (
                                  <div>
                                    <p className="mb-1 text-xs font-medium uppercase">
                                      Roles Needed
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {Object.entries(
                                        submission.required_roles_by_type,
                                      ).map(([role, count]) => (
                                        <Badge
                                          key={role}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {role} ({count})
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                                {submission.intended_actions &&
                                submission.intended_actions.length > 0 ? (
                                  <div>
                                    <p className="mb-1 text-xs font-medium uppercase">
                                      Intended Actions
                                    </p>
                                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                      {submission.intended_actions
                                        .slice(0, 3)
                                        .map((action) => (
                                          <li key={action}>{action}</li>
                                        ))}
                                    </ul>
                                    {submission.intended_actions.length > 3 ? (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        +
                                        {submission.intended_actions.length - 3}{" "}
                                        more
                                      </p>
                                    ) : null}
                                  </div>
                                ) : null}
                              </CardContent>
                              <CardFooter
                                className="text-xs text-muted-foreground"
                                suppressHydrationWarning
                              >
                                <div className="flex flex-col gap-0.5">
                                  {submission.date_of_event ? (
                                    <span>
                                      <span className="font-medium">
                                        Date of event:
                                      </span>{" "}
                                      {new Date(
                                        submission.date_of_event,
                                      ).toLocaleString()}
                                    </span>
                                  ) : null}
                                  <span>
                                    <span className="font-medium">
                                      Created:
                                    </span>{" "}
                                    {new Date(
                                      submission.timestamp,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </CardFooter>
                            </Card>
                          </LinkComponent>
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
                    <LinkComponent
                      key={submission.id}
                      href={getHref(submission)}
                    >
                      <Card
                        className="h-full transition hover:shadow-lg hover:ring-2 hover:ring-primary/40 dark:hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]"
                        suppressHydrationWarning
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between gap-2">
                            <span className="truncate min-w-0">
                              {submission.location_label ?? "Unknown Location"}
                            </span>
                            <Badge>{humanize(submission.status)}</Badge>
                          </CardTitle>
                          {submission.state ? (
                            <CardDescription className="text-xs line-clamp-1">
                              {submission.type ? (
                                <DispatchTypeBadge type={submission.type} />
                              ) : null}
                              {submission.type ? " • " : null}
                              {submission.state}
                            </CardDescription>
                          ) : null}
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          {submission.required_roles_by_type &&
                          Object.keys(submission.required_roles_by_type)
                            .length > 0 ? (
                            <div>
                              <p className="mb-1 text-xs font-medium uppercase">
                                Roles Needed
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(
                                  submission.required_roles_by_type,
                                ).map(([role, count]) => (
                                  <Badge
                                    key={role}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {role} ({count})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {submission.intended_actions &&
                          submission.intended_actions.length > 0 ? (
                            <div>
                              <p className="mb-1 text-xs font-medium uppercase">
                                Intended Actions
                              </p>
                              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                {submission.intended_actions
                                  .slice(0, 3)
                                  .map((action) => (
                                    <li key={action}>{action}</li>
                                  ))}
                              </ul>
                              {submission.intended_actions.length > 3 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  +{submission.intended_actions.length - 3} more
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </CardContent>
                        <CardFooter
                          className="text-xs text-muted-foreground"
                          suppressHydrationWarning
                        >
                          <div className="flex flex-col gap-0.5">
                            {submission.date_of_event ? (
                              <span>
                                <span className="font-medium">
                                  Date of event:
                                </span>{" "}
                                {new Date(
                                  submission.date_of_event,
                                ).toLocaleString()}
                              </span>
                            ) : null}
                            <span>
                              <span className="font-medium">Created:</span>{" "}
                              {new Date(submission.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </CardFooter>
                      </Card>
                    </LinkComponent>
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
