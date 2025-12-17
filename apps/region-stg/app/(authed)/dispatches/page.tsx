"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { DispatchListLayout } from "@workspace/ui/layout/dispatch/dispatch-list-layout";
import { DispatchSubmission } from "@workspace/store/types/global.ts";
import { mapRowToSubmission } from "@workspace/ui/hooks/map-row-to-submission";
import { REGION_IDENTIFIER } from "@/app/brand_settings";
type ListFilters = {
  q?: string;
  status?: string;
  type?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};
async function fetchDispatchesFromDatabase(
  filters?: ListFilters,
): Promise<DispatchSubmission[] | null> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      const { status, type, from, to, q } = filters;
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (q) params.set("q", q);
    }
    const response = await fetch(`/api/dispatches?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch dispatches");
    const data = await response.json();
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToSubmission);
  } catch (e) {
    console.warn("[DispatchListDataLayer] fetch error", e);
    return null;
  }
}
export default function DispatchesPage() {
  const submissions = useDispatchStore((s) => s.submissions);
  const replaceSubmissions = useDispatchStore((s) => s.replaceSubmissions);
  const [remoteSubmissions, setRemoteSubmissions] = useState<
    typeof submissions | null
  >(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      setLoading(true);
      try {
        const paramsRecord = Object.fromEntries(
          (searchParams ?? new URLSearchParams()).entries(),
        );
        const filters: ListFilters = {
          q: paramsRecord.q,
          status: paramsRecord.status,
          type: paramsRecord.type,
          from: paramsRecord.from,
          to: paramsRecord.to,
        };
        const result = await fetchDispatchesFromDatabase(filters);
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          // Dedupe by id to avoid duplicate keys in UI
          const map = new Map<string, DispatchSubmission>();
          for (const r of result) map.set(r.id, r);
          const unique = Array.from(map.values());
          setRemoteSubmissions(unique);
          // Replace local persisted store with latest from DB
          replaceSubmissions(unique);
        } else if (!cancelled && Array.isArray(result) && result.length === 0) {
          setRemoteSubmissions([]);
          replaceSubmissions([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "DispatchListDataLayer: failed to fetch dispatches",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [replaceSubmissions, searchParams]);
  const data = useMemo(() => {
    const base = remoteSubmissions ?? submissions;
    // Dedupe by id on the client to prevent duplicate key warnings during initial render
    const map = new Map<string, DispatchSubmission>();
    for (const r of base) map.set(r.id, r);
    const unique = Array.from(map.values());
    return unique.sort(
      (a, b) =>
        new Date(a.date_of_event ?? a.timestamp).getTime() -
        new Date(b.date_of_event ?? b.timestamp).getTime(),
    );
  }, [remoteSubmissions, submissions]);
  return (
    <DispatchListLayout
      submissions={data}
      initialUrlParams={Object.fromEntries(
        (searchParams ?? new URLSearchParams()).entries(),
      )}
      onUrlChange={(url) => router.replace(url)}
      persistKey={`dispatchList.filters:${REGION_IDENTIFIER}`}
      LinkComponent={({ href, children }) => (
        <Link href={href} className="block hover:no-underline">
          {children}
        </Link>
      )}
      loadingState={
        loading ? (
          <p className="text-sm text-muted-foreground">
            Loading dispatch submissions...
          </p>
        ) : undefined
      }
    />
  );
}
