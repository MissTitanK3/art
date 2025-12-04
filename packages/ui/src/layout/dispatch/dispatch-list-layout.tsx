"use client";
import { useEffect, useMemo, useState } from "react";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch.ts";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/primitives/tabs";
import { DispatchFilters } from "./dispatch-filters";
import { DispatchUpcomingList } from "./dispatch-upcoming-list";
import { DispatchPastList } from "./dispatch-past-list";
import { DispatchPagination } from "./dispatch-pagination";
import { flattenGroups, groupByBucket } from "./dispatch-buckets";
import { useDispatchFilterState } from "./use-dispatch-filter-state";
type LinkWrapperProps = {
  href: string;
  children: React.ReactNode;
};
type DateRange = {
  from?: Date;
  to?: Date;
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
  const [calendarMonths, setCalendarMonths] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showTraining, setShowTraining] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setCalendarMonths(window.innerWidth < 640 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    setPage(1);
  }, [activeTab, setPage, showTraining]);
  const options = useMemo(() => buildFilterOptions(submissions), [submissions]);
  useEffect(() => {
    if (status !== "all" && !options.statuses.includes(status)) {
      setStatus("all");
    }
  }, [options.statuses, setStatus, status]);
  useEffect(() => {
    if (type !== "all" && !options.types.includes(type)) {
      setType("all");
    }
  }, [options.types, setType, type]);
  useEffect(() => {
    if (type === "training" && !showTraining) {
      setShowTraining(true);
    }
  }, [showTraining, type]);
  const { tabScopedSubmissions } = useMemo(() => {
    const now = new Date();
    const scopedCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const scoped =
      activeTab === "upcoming"
        ? submissions.filter(
            (s) =>
              s.status !== "archived" &&
              s.date_of_event &&
              new Date(s.date_of_event) >= scopedCutoff
          )
        : submissions.filter(
            (s) =>
              s.status === "archived" ||
              (s.date_of_event && new Date(s.date_of_event) < scopedCutoff)
          );
    return { tabScopedSubmissions: scoped };
  }, [submissions, activeTab]);
  const filtered = useMemo(
    () =>
      applyFilters(tabScopedSubmissions, {
        query: debouncedQuery,
        status,
        type,
        dateRange,
        showTraining,
      }),
    [
      tabScopedSubmissions,
      debouncedQuery,
      status,
      type,
      dateRange,
      showTraining,
    ]
  );
  const grouped = useMemo(() => groupByBucket(filtered), [filtered]);
  const groupedFlattened = useMemo(
    () => flattenGroups(grouped.order, grouped.groups),
    [grouped]
  );
  const pastSorted = useMemo(() => {
    if (activeTab !== "past") return filtered;
    return [...filtered].sort((a, b) => {
      const da = a.date_of_event
        ? new Date(a.date_of_event).getTime()
        : new Date(a.timestamp).getTime();
      const db = b.date_of_event
        ? new Date(b.date_of_event).getTime()
        : new Date(b.timestamp).getTime();
      return db - da;
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
  const hasFilters =
    Boolean(query.trim()) ||
    status !== "all" ||
    type !== "all" ||
    Boolean(dateRange.from) ||
    Boolean(dateRange.to) ||
    showTraining;
  const noSubmissions = submissions.length === 0;
  const noResults = total === 0;
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Live dispatches grouped by urgency for fast triage.
          </p>
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
          {total > 0 ? `${total} matching ${activeTab} items` : "No matches"}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="sticky top-0 z-20 -mx-4 mb-1 flex items-center justify-between bg-background/90 px-4 pt-3 backdrop-blur sm:static sm:mx-0 sm:px-0">
          <TabsList aria-label="Dispatch views">
            <TabsTrigger value="upcoming">Now & Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past & Archived</TabsTrigger>
          </TabsList>
          {activeTab === "upcoming" ? <UrgencyLegend /> : null}
        </div>
      </Tabs>

      {enableFilters ? (
        <DispatchFilters
          query={query}
          status={status}
          type={type}
          dateRange={dateRange}
          options={options}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onTypeChange={setType}
          onDateRangeChange={setDateRange}
          onClearDateRange={clearDateRange}
          onReset={resetFilters}
          calendarMonths={calendarMonths}
          showClear={hasFilters}
          showTraining={showTraining}
          onToggleTraining={setShowTraining}
        />
      ) : null}

      <div className="mt-4 space-y-8">
        {activeTab === "upcoming" ? (
          noResults ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {noSubmissions
                ? (loadingState ?? emptyState)
                : "No upcoming dispatches match these filters."}
            </div>
          ) : (
            <DispatchUpcomingList
              order={grouped.order}
              groups={grouped.groups}
              pageItems={pageItems}
              LinkComponent={LinkComponent}
              getHref={getHref}
            />
          )
        ) : (
          <section>
            <h2 className="text-lg font-semibold mb-3">Past & Archived</h2>
            {noResults ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                {noSubmissions
                  ? (loadingState ?? emptyState)
                  : "No past or archived dispatches match these filters."}
              </div>
            ) : (
              <DispatchPastList
                items={pageItems}
                LinkComponent={LinkComponent}
                getHref={getHref}
              />
            )}
          </section>
        )}
      </div>

      {enablePagination && !noResults ? (
        <DispatchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={(next) =>
            setPage(Math.max(1, Math.min(totalPages, next)))
          }
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(v) => setPageSize(v || pageSize)}
        />
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
function buildFilterOptions(submissions: DispatchSubmission[]) {
  const statusKeys = Object.keys(STATUS_META);
  const typeKeys = Object.keys(DISPATCH_TYPE_LABELS);
  return {
    statuses:
      statusKeys.length > 0
        ? (statusKeys as string[])
        : Array.from(
            new Set(
              submissions.map((s) => s.status).filter(Boolean) as string[]
            )
          ).sort(),
    types:
      typeKeys.length > 0
        ? (typeKeys as string[])
        : Array.from(
            new Set(submissions.map((s) => s.type).filter(Boolean) as string[])
          ).sort(),
  };
}
function applyFilters(
  submissions: DispatchSubmission[],
  filters: {
    query: string;
    status: string;
    type: string;
    dateRange: DateRange;
    showTraining: boolean;
  }
) {
  const q = filters.query.trim().toLowerCase();
  return submissions.filter((s) => {
    const isTrainingType = s.type === "training";
    const isTrainingFlag = Boolean(s.training);
    if (!filters.showTraining && filters.type !== "training") {
      if (isTrainingType || isTrainingFlag) return false;
    }
    if (filters.status !== "all" && s.status !== filters.status) return false;
    if (filters.type !== "all" && s.type !== filters.type) return false;
    if (filters.dateRange.from || filters.dateRange.to) {
      if (!s.date_of_event) return false;
      const ts = new Date(s.date_of_event).getTime();
      if (Number.isNaN(ts)) return false;
      let fromMs: number | undefined = undefined;
      if (filters.dateRange.from) {
        const f = new Date(filters.dateRange.from);
        const isMidnight =
          f.getHours() === 0 &&
          f.getMinutes() === 0 &&
          f.getSeconds() === 0 &&
          f.getMilliseconds() === 0;
        fromMs = isMidnight ? f.setHours(0, 0, 0, 0) : f.getTime();
      }
      const toMs = filters.dateRange.to
        ? new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
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
}
function UrgencyLegend() {
  return (
    <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
      <span className="font-medium">Urgency:</span>
      <div className="flex items-center gap-1">
        <span>🚨 Immediate</span>
      </div>
      <div className="flex items-center gap-1">
        <span>⚠️ Upcoming</span>
      </div>
      <div className="flex items-center gap-1">
        <span>🪴 Future</span>
      </div>
    </div>
  );
}
export default DispatchListLayout;
