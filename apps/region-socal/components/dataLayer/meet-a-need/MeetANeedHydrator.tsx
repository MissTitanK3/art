"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type { MeetANeed } from "@workspace/store/types/meet-a-need";
import { useMeetANeedStoreProvider } from "@/providers/MeetANeedStoreProvider";

function mapRow(row: any): MeetANeed {
  return {
    id: String(row?.id ?? crypto.randomUUID()),
    created_by: row?.created_by ?? null,
    category: String(row?.category ?? "other"),
    description: String(row?.description ?? ""),
    urgency: (row?.urgency as any) ?? "normal",
    visibility: (row?.visibility as any) ?? "region",
    location:
      row?.location && typeof row.location === "object"
        ? row.location
        : undefined,
    contact_preference:
      typeof row?.contact_preference === "string"
        ? row.contact_preference
        : undefined,
    status: (row?.status as any) ?? "open",
    responders: Array.isArray(row?.responders) ? row.responders : [],
    assigned_to: Array.isArray(row?.assigned_to) ? row.assigned_to : undefined,
    fulfilled_at: row?.fulfilled_at ?? null,
    created_at: String(row?.created_at ?? new Date().toISOString()),
  } satisfies MeetANeed;
}

type ListFilters = {
  q?: string;
  category?: string;
  urgency?: string;
  visibility?: string;
  status?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

type QueryMeta = { total: number };

const MeetANeedQueryContext = React.createContext<QueryMeta>({ total: 0 });
export function useMeetANeedQueryMeta() {
  return React.useContext(MeetANeedQueryContext);
}

export default function MeetANeedHydrator() {
  const setAll = useMeetANeedStoreProvider((s) => s.setAll);
  const [meta, setMeta] = React.useState<QueryMeta>({ total: 0 });
  const searchParams = useSearchParams();

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const params = Object.fromEntries(
          (searchParams ?? new URLSearchParams()).entries(),
        );
        const filters: ListFilters = {
          q: params.q,
          category: params.category,
          urgency: params.urgency,
          visibility: params.visibility,
          status: params.status,
          from: params.from,
          to: params.to,
        };
        const pageSize = Math.max(1, Number(params.size) || 10);
        const page = Math.max(1, Number(params.page) || 1);
        const fromIdx = (page - 1) * pageSize;
        const toIdx = fromIdx + pageSize - 1;

        const client = getSupabaseBrowserClient();
        let query = client
          .from("meet_a_need")
          .select("*", { count: "exact", head: false })
          .order("created_at", { ascending: false });

        if (filters.category && filters.category !== "all")
          query = query.eq("category", filters.category);
        if (filters.urgency && filters.urgency !== "all")
          query = query.eq("urgency", filters.urgency);
        if (filters.visibility && filters.visibility !== "all")
          query = query.eq("visibility", filters.visibility);
        if (filters.status && filters.status !== "all")
          query = query.eq("status", filters.status);
        if (filters.from)
          query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
        if (filters.to)
          query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
        if (filters.q && filters.q.trim().length > 0) {
          const like = `%${filters.q}%`;
          // PostgREST .or() expects column.op.value syntax, not function form
          query = query.or(
            `category.ilike.${like},description.ilike.${like},contact_preference.ilike.${like}`,
          );
        }

        const { data, error, count } = await query.range(fromIdx, toIdx);
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        const needs = rows.map(mapRow);
        if (!cancelled) {
          setAll(needs);
          setMeta({ total: typeof count === "number" ? count : needs.length });
        }
      } catch (e) {
        console.warn("[MeetANeedHydrator] failed to hydrate", e);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [setAll, searchParams]);

  return <MeetANeedQueryContext.Provider value={meta} />;
}
