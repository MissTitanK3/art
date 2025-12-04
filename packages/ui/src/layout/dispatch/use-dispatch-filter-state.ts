import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";
type DateRange = {
  from?: Date;
  to?: Date;
};
type DispatchFilterOptions = {
  persistKey?: string;
  initialUrlParams?: Record<string, string | undefined>;
  onUrlChange?: (url: string) => void;
  initialPageSize?: number;
  defaultPageSize: number;
};
type DispatchFilterState = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  debouncedQuery: string;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  clearDateRange: () => void;
  resetFilters: () => void;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};
const PERSIST_VERSION = 2;
type PersistedDispatchFilters = {
  query: string;
  status: string;
  type: string;
  from?: string;
  to?: string;
  pageSize: number;
  page: number;
};
const NOOP_STORAGE: Storage = {
  get length() {
    return 0;
  },
  clear() {
    /* noop */
  },
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {
    /* noop */
  },
  setItem() {
    /* noop */
  },
};
export function useDispatchFilterState({
  persistKey,
  initialUrlParams,
  onUrlChange,
  initialPageSize,
  defaultPageSize,
}: DispatchFilterOptions): DispatchFilterState {
  const resolvedInitialPageSize =
    typeof initialPageSize === "number" && initialPageSize > 0
      ? initialPageSize
      : defaultPageSize;
  const storageKey = persistKey ?? "__dispatch-filter-state__noop__";
  const defaultPersistedFilters = useMemo<PersistedDispatchFilters>(
    () => ({
      query: "",
      status: "all",
      type: "all",
      from: undefined,
      to: undefined,
      pageSize: resolvedInitialPageSize,
      page: 1,
    }),
    [resolvedInitialPageSize],
  );
  const [persistedFilters, setPersistedFilters] =
    useLocalStorage<PersistedDispatchFilters>(
      storageKey,
      defaultPersistedFilters,
      {
        version: PERSIST_VERSION,
        sync: Boolean(persistKey),
        migrate: (payload, storedVersion) => {
          if (!payload || typeof payload !== "object") {
            return {
              query: "",
              status: "all",
              type: "all",
              from: undefined,
              to: undefined,
              pageSize: resolvedInitialPageSize,
              page: 1,
            } as PersistedDispatchFilters;
          }
          const candidate = payload as Partial<PersistedDispatchFilters>;
          const coerceString = (value: unknown, fallback: string) =>
            typeof value === "string" && value.length > 0 ? value : fallback;
          const coerceOptionalString = (value: unknown) =>
            typeof value === "string" && value.length > 0 ? value : undefined;
          const coerceNumber = (value: unknown, fallback: number) => {
            const num = Number(value);
            return Number.isFinite(num) && num > 0 ? num : fallback;
          };
          if ((storedVersion ?? 1) < PERSIST_VERSION) {
            // Clear legacy dates that may not exist
            if (!candidate.from) candidate.from = undefined;
            if (!candidate.to) candidate.to = undefined;
          }
          return {
            query: coerceString(candidate.query, ""),
            status: coerceString(candidate.status, "all"),
            type: coerceString(candidate.type, "all"),
            from: coerceOptionalString(candidate.from),
            to: coerceOptionalString(candidate.to),
            pageSize: coerceNumber(candidate.pageSize, resolvedInitialPageSize),
            page: coerceNumber(candidate.page, 1),
          } as PersistedDispatchFilters;
        },
        storage: persistKey ? undefined : NOOP_STORAGE,
      },
    );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>(() => ({}));
  const [pageSize, setPageSize] = useState<number>(resolvedInitialPageSize);
  const [page, setPage] = useState<number>(1);
  const lastQueryRef = useRef<string | null>(null);
  const persistHydratedRef = useRef<boolean>(!persistKey);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(handle);
  }, [query]);
  useEffect(() => {
    if (!persistKey || persistHydratedRef.current) return;
    persistHydratedRef.current = true;
    const parseDate = (value: string | undefined): Date | undefined => {
      if (!value) return undefined;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    };
    setQuery(persistedFilters.query ?? "");
    setStatus(persistedFilters.status ?? "all");
    setType(persistedFilters.type ?? "all");
    setDateRange({
      from: parseDate(persistedFilters.from),
      to: parseDate(persistedFilters.to),
    });
    setPageSize(persistedFilters.pageSize ?? resolvedInitialPageSize);
    setPage(persistedFilters.page ?? 1);
  }, [persistKey, persistedFilters, resolvedInitialPageSize]);
  useEffect(() => {
    if (typeof window === "undefined") return;
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
    setStatus((prev) => {
      if (st === "all") return "all";
      return st;
    });
    setType((prev) => {
      if (tp === "all") return "all";
      return tp;
    });
    if (from || to) {
      const f = from ? new Date(from) : undefined;
      const t = to ? new Date(to) : undefined;
      setDateRange({
        from: f && !isNaN(f as any) ? f : undefined,
        to: t && !isNaN(t as any) ? t : undefined,
      });
    }
    if (size) {
      const parsed = Number(size);
      if (!Number.isNaN(parsed) && parsed > 0) setPageSize(parsed);
    }
    if (pg) {
      const parsed = Number(pg);
      if (!Number.isNaN(parsed) && parsed > 0) setPage(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    const trimmed = debouncedQuery.trim();
    if (trimmed) params.set("q", trimmed);
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);
    if (dateRange.from)
      params.set("from", dateRange.from.toISOString().slice(0, 10));
    if (dateRange.to) params.set("to", dateRange.to.toISOString().slice(0, 10));
    params.set("size", String(pageSize));
    params.set("page", String(page));
    return params.toString();
  }, [debouncedQuery, status, type, dateRange, pageSize, page]);
  const currentCanonicalQueryString = useCallback(() => {
    if (typeof window === "undefined") return "";
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
      const value = src.get(key);
      if (value && value.length > 0) params.set(key, value);
    }
    return params.toString();
  }, []);
  useEffect(() => {
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
      if (!persistHydratedRef.current) return;
      const next: PersistedDispatchFilters = {
        query,
        status,
        type,
        from: dateRange.from ? dateRange.from.toISOString() : undefined,
        to: dateRange.to ? dateRange.to.toISOString() : undefined,
        pageSize,
        page,
      };
      const prev = persistedFilters;
      const hasDiff =
        prev.query !== next.query ||
        prev.status !== next.status ||
        prev.type !== next.type ||
        prev.from !== next.from ||
        prev.to !== next.to ||
        prev.pageSize !== next.pageSize ||
        prev.page !== next.page;
      if (!hasDiff) return;
      setPersistedFilters(next);
    }
  }, [
    buildQueryString,
    currentCanonicalQueryString,
    dateRange.from,
    dateRange.to,
    onUrlChange,
    persistedFilters,
    page,
    pageSize,
    persistKey,
    query,
    status,
    type,
    setPersistedFilters,
  ]);
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status, type, dateRange, pageSize]);
  const clearDateRange = useCallback(() => {
    setDateRange({});
  }, []);
  const resetFilters = useCallback(() => {
    setQuery("");
    setStatus("all");
    setType("all");
    setDateRange({});
  }, []);
  return {
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
  };
}
