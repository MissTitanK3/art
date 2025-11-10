"use client";

import React, { ReactNode } from "react";
import PodCard from "@workspace/ui/components/server/pods/PodCard";
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

export type PodsListLayoutPod = {
  id?: string | number;
  slug: string;
  name: string;
  channel?: string;
  area?: string;
  channelLink?: string;
  [key: string]: unknown;
};

export type PodsListLayoutProps<TPod extends PodsListLayoutPod> = {
  pods: TPod[];
  title?: ReactNode;
  renderPod?: (args: { pod: TPod; DefaultCard: ReactNode }) => ReactNode;
  emptyState?: ReactNode;
  gridClassName?: string;
  // Filters + pagination
  enableFilters?: boolean;
  enablePagination?: boolean;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  // URL + persistence integrations (optional)
  initialUrlParams?: Record<string, string | undefined>;
  onUrlChange?: (url: string) => void;
  persistKey?: string;
};

export function PodsListLayout<TPod extends PodsListLayoutPod>({
  pods,
  title = "Pods Directory",
  renderPod,
  emptyState,
  gridClassName = "grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3",
  enableFilters = true,
  enablePagination = true,
  pageSizeOptions = [9, 18, 27],
  initialPageSize,
  initialUrlParams,
  onUrlChange,
  persistKey,
}: PodsListLayoutProps<TPod>) {
  const heading =
    typeof title === "string" ? (
      <h1 className="text-2xl font-bold">{title}</h1>
    ) : (
      title
    );

  const empty = emptyState ?? (
    <p className="text-sm text-muted-foreground">No pods available.</p>
  );

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  React.useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(h);
  }, [query]);
  const [area, setArea] = React.useState<string>("all");
  const [channel, setChannel] = React.useState<string>("all");
  const [pageSize, setPageSize] = React.useState<number>(() =>
    typeof initialPageSize === "number" && initialPageSize > 0
      ? initialPageSize
      : (pageSizeOptions?.[0] ?? 9),
  );
  const [page, setPage] = React.useState<number>(1);
  const lastQueryRef = React.useRef<string | null>(null);

  // derive filter options from data
  const options = React.useMemo(() => {
    const areas = new Set<string>();
    const channels = new Set<string>();
    for (const p of pods) {
      if (typeof p.area === "string" && p.area) areas.add(p.area);
      // channel string or channels array
      if (typeof (p as any).channel === "string" && (p as any).channel)
        channels.add((p as any).channel);
      const arr = (p as any).channels as Array<{ type: string }> | undefined;
      if (Array.isArray(arr))
        arr.forEach((c) => c?.type && channels.add(c.type));
    }
    return {
      areas: Array.from(areas).sort(),
      channels: Array.from(channels).sort(),
    };
  }, [pods]);

  // initialize from URL or localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (persistKey) {
      try {
        const raw = window.localStorage.getItem(persistKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (typeof saved?.query === "string") setQuery(saved.query);
          if (typeof saved?.area === "string") setArea(saved.area);
          if (typeof saved?.channel === "string") setChannel(saved.channel);
          if (typeof saved?.pageSize === "number") setPageSize(saved.pageSize);
          if (typeof saved?.page === "number") setPage(saved.page);
        }
      } catch {
        /* ignore */
      }
    }

    const src =
      initialUrlParams ??
      Object.fromEntries(new URLSearchParams(window.location.search).entries());
    if (typeof src.q === "string") setQuery(src.q);
    if (typeof src.area === "string") setArea(src.area);
    if (typeof src.channel === "string") setChannel(src.channel);
    if (typeof src.size === "string") {
      const n = Number(src.size);
      if (!Number.isNaN(n) && n > 0) setPageSize(n);
    }
    if (typeof src.page === "string") {
      const n = Number(src.page);
      if (!Number.isNaN(n) && n > 0) setPage(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildQueryString = React.useCallback(() => {
    const params = new URLSearchParams();
    const q = debouncedQuery.trim();
    if (q) params.set("q", q);
    if (area && area !== "all") params.set("area", area);
    if (channel && channel !== "all") params.set("channel", channel);
    params.set("size", String(pageSize));
    params.set("page", String(page));
    return params.toString();
  }, [debouncedQuery, area, channel, pageSize, page]);

  const currentCanonicalQueryString = React.useCallback(() => {
    const src = new URLSearchParams(window.location.search);
    ["_rsc", "__nextDataReq", "next-router-state-tree", "next-url"].forEach(
      (k) => src.delete(k),
    );
    const params = new URLSearchParams();
    const order = ["q", "area", "channel", "size", "page"] as const;
    for (const key of order) {
      const v = src.get(key);
      if (v && v.length > 0) params.set(key, v);
    }
    return params.toString();
  }, []);

  // sync to URL + persist
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const qs = buildQueryString();
    const currentQs = currentCanonicalQueryString();
    if (qs !== lastQueryRef.current) {
      lastQueryRef.current = qs;
      const newUrl = `${window.location.pathname}?${qs}`;
      if (qs !== currentQs) {
        if (onUrlChange) onUrlChange(newUrl);
        else window.history.replaceState({}, "", newUrl);
      }
    }
    if (persistKey) {
      try {
        window.localStorage.setItem(
          persistKey,
          JSON.stringify({ query, area, channel, pageSize, page }),
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
    area,
    channel,
    pageSize,
    page,
  ]);

  const filtered = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return pods.filter((p) => {
      if (area !== "all" && p.area !== area) return false;
      if (channel !== "all") {
        const hasChannelString =
          typeof (p as any).channel === "string" &&
          (p as any).channel === channel;
        const arr = (p as any).channels as Array<{ type: string }> | undefined;
        const hasChannelArr =
          Array.isArray(arr) && arr.some((c) => c?.type === channel);
        if (!hasChannelString && !hasChannelArr) return false;
      }
      if (q.length > 0) {
        const hay = [
          p.name,
          p.slug,
          p.area,
          (p as any).channel,
          (p as any).channelLink,
        ]
          .filter(Boolean)
          .join(" \n ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [pods, debouncedQuery, area, channel]);

  // reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, area, channel, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = enablePagination
    ? filtered.slice(startIndex, endIndex)
    : filtered;

  const handleGoTo = (p: number) =>
    setPage(Math.max(1, Math.min(totalPages, p)));

  const renderPaginationNumbers = () => {
    const items: React.ReactNode[] = [];
    const windowSize = 1;
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
    if (currentPage - windowSize > 2)
      items.push(
        <PaginationItem key="se">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);
    for (let p = start; p <= end; p++) addPage(p);
    if (currentPage + windowSize < totalPages - 1)
      items.push(
        <PaginationItem key="ee">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    addPage(totalPages);
    return items;
  };

  return (
    <section>
      {heading}
      {pods.length === 0 ? (
        <div className="mt-4">{empty}</div>
      ) : (
        <>
          {enableFilters ? (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex w-full flex-wrap items-stretch gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pods by name, slug, area..."
                  className="w-full sm:max-w-md"
                />
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {options.areas.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {options.channels.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(query || area !== "all" || channel !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setQuery("");
                      setArea("all");
                      setChannel("all");
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

          <div className={gridClassName}>
            {pageItems.map((pod) => {
              const key =
                "id" in pod && pod.id !== undefined && pod.id !== null
                  ? String(pod.id)
                  : pod.slug;
              const defaultCard = <PodCard pod={pod} />;
              const rendered = renderPod
                ? renderPod({ pod, DefaultCard: defaultCard })
                : defaultCard;
              if (React.isValidElement(rendered))
                return React.cloneElement(rendered, { key });
              return <React.Fragment key={key}>{rendered}</React.Fragment>;
            })}
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
      )}
    </section>
  );
}

export default PodsListLayout;
