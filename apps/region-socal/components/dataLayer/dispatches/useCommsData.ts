"use client";

import * as React from "react";
import type {
  ComTeam,
  ComOperator,
  ComLog,
  ComChannel,
  ComBriefing,
  CommsMessageType,
  CommsImportance,
  ComAlert,
} from "@workspace/store/types/comms.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

type UseCommsDataArgs = { eventId: string };

export function useCommsData({ eventId }: UseCommsDataArgs) {
  const [teams, setTeams] = React.useState<ComTeam[]>([]);
  const [operators, setOperators] = React.useState<ComOperator[]>([]);
  const [logs, setLogs] = React.useState<ComLog[]>([]);
  const [channels, setChannels] = React.useState<ComChannel[]>([]);
  const [briefing, setBriefing] = React.useState<ComBriefing | null>(null);
  const [alerts, setAlerts] = React.useState<ComAlert[]>([]);
  const [globalCheckInMinutes, setGlobalCheckInMinutes] = React.useState<
    number | undefined
  >(60);
  const clientRef = React.useRef<ReturnType<
    typeof getSupabaseBrowserClient
  > | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const client = getSupabaseBrowserClient();
    clientRef.current = client;

    async function initialFetch() {
      try {
        // NOTE: real tables are expected: com_teams, com_operators, com_logs, com_channels, com_briefings
        const [teamsRes, opsRes, logsRes, chansRes, briefRes, alertsRes] =
          await Promise.all([
            client.from("com_teams").select("*").eq("event_id", eventId),
            client.from("com_operators").select("*"),
            client.from("com_logs").select("*").eq("event_id", eventId),
            client.from("com_channels").select("*"),
            client
              .from("com_briefings")
              .select("*")
              .eq("event_id", eventId)
              .maybeSingle(),
            client
              .from("com_alerts")
              .select("*")
              .eq("event_id", eventId)
              .order("updated_at", { ascending: false }),
          ]);
        if (!cancelled) {
          const teamRows = Array.isArray(teamsRes.data)
            ? (teamsRes.data as any)
            : [];
          setTeams(teamRows);
          setOperators(Array.isArray(opsRes.data) ? (opsRes.data as any) : []);
          setLogs(Array.isArray(logsRes.data) ? (logsRes.data as any) : []);
          setChannels(
            Array.isArray(chansRes.data) ? (chansRes.data as any) : [],
          );
          setBriefing((briefRes.data as any) ?? null);
          setAlerts(
            Array.isArray(alertsRes.data) ? (alertsRes.data as any) : [],
          );
        }
      } catch (e) {
        // non-fatal in initial scaffolding
        console.warn("[useCommsData] initial fetch error", e);
      }
    }

    initialFetch();

    // Real-time channels can be set up here (commented for safety):
    // const sub = client
    //   .channel('comms')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'com_logs', filter: `event_id=eq.${eventId}` }, payload => { /* update logs */ })
    //   .subscribe();
    // return () => { sub.unsubscribe(); cancelled = true; };

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const addLog = React.useCallback(
    (log: {
      operator_id?: string | null;
      incident_id?: string | null;
      message: string;
      message_type: CommsMessageType;
      importance: CommsImportance;
      timestamp?: string;
      tags?: string[];
    }) => {
      const entry: ComLog = {
        id: crypto.randomUUID(),
        timestamp: log.timestamp ?? new Date().toISOString(),
        message: log.message,
        message_type: log.message_type,
        importance: log.importance,
        operator_id: log.operator_id ?? null,
        incident_id: log.incident_id ?? null,
        tags: log.tags ?? [],
        event_id: eventId,
      };
      setLogs((prev) => [...prev, entry]);
      // Persist to DB (best-effort)
      const client = clientRef.current ?? getSupabaseBrowserClient();
      // Use async IIFE to avoid PromiseLike `.catch` typing issue
      void (async () => {
        try {
          const { error } = await client.from("com_logs").insert({
            id: entry.id,
            event_id: entry.event_id,
            operator_id: entry.operator_id ?? null,
            incident_id: entry.incident_id ?? null,
            message: entry.message,
            message_type: entry.message_type,
            importance: entry.importance,
            timestamp: entry.timestamp,
            tags: entry.tags ?? [],
          });
          if (error)
            console.warn("[useCommsData] insert com_logs failed", error);
        } catch (e) {
          console.warn("[useCommsData] insert com_logs error", e);
        }
      })();
    },
    [eventId],
  );

  // Operators: check-in action
  const checkInOperator = React.useCallback(async (id: string) => {
    const nowIso = new Date().toISOString();
    setOperators((prev) =>
      prev.map((op) => (op.id === id ? { ...op, last_check_in: nowIso } : op)),
    );
    try {
      const client = clientRef.current ?? getSupabaseBrowserClient();
      const { error } = await client
        .from("com_operators")
        .update({ last_check_in: nowIso })
        .eq("id", id);
      if (error)
        console.warn(
          "[useCommsData] update com_operators last_check_in failed",
          error,
        );
    } catch (e) {
      console.warn(
        "[useCommsData] update com_operators last_check_in error",
        e,
      );
    }
    return nowIso;
  }, []);

  // Teams CRUD
  const createTeam = React.useCallback(
    async (input: Omit<ComTeam, "id">) => {
      const id = crypto.randomUUID();
      setTeams((prev) => [...prev, { id, ...input } as ComTeam]);
      const client = clientRef.current ?? getSupabaseBrowserClient();
      const { error } = await client.from("com_teams").insert({
        id,
        event_id: eventId,
        name: input.name,
        channel: input.channel ?? null,
        encryption_mode: input.encryption_mode ?? null,
        assigned_dispatch_lead: input.assigned_dispatch_lead ?? null,
        notes: input.notes ?? null,
        location_label: (input as any).location_label ?? null,
        default_check_in_interval_minutes:
          input.default_check_in_interval_minutes ?? null,
      });
      if (error) console.warn("[useCommsData] insert com_teams failed", error);
      return id;
    },
    [eventId],
  );

  const updateTeam = React.useCallback(
    async (id: string, patch: Partial<ComTeam>) => {
      setTeams((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
      const client = clientRef.current ?? getSupabaseBrowserClient();
      const payload: any = { ...patch };
      const { error } = await client
        .from("com_teams")
        .update(payload)
        .eq("id", id);
      if (error) console.warn("[useCommsData] update com_teams failed", error);
    },
    [],
  );

  const deleteTeam = React.useCallback(async (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    const client = clientRef.current ?? getSupabaseBrowserClient();
    const { error } = await client.from("com_teams").delete().eq("id", id);
    if (error) console.warn("[useCommsData] delete com_teams failed", error);
  }, []);

  // Team check-in action
  const checkInTeam = React.useCallback(async (id: string) => {
    const nowIso = new Date().toISOString();
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, last_check_in: nowIso } : t)),
    );
    try {
      const client = clientRef.current ?? getSupabaseBrowserClient();
      const { error } = await client
        .from("com_teams")
        .update({ last_check_in: nowIso })
        .eq("id", id);
      if (error)
        console.warn(
          "[useCommsData] update com_teams last_check_in failed",
          error,
        );
    } catch (e) {
      console.warn("[useCommsData] update com_teams last_check_in error", e);
    }
    return nowIso;
  }, []);

  // Briefing upsert
  const upsertBriefing = React.useCallback(
    async (patch: Omit<ComBriefing, "id" | "event_id" | "updated_at">) => {
      const client = clientRef.current ?? getSupabaseBrowserClient();
      const nowIso = new Date().toISOString();
      if (briefing?.id) {
        setBriefing({ ...briefing, ...patch, updated_at: nowIso });
        const { error } = await client
          .from("com_briefings")
          .update({ ...patch, updated_at: nowIso })
          .eq("id", briefing.id);
        if (error)
          console.warn("[useCommsData] update com_briefings failed", error);
        return briefing.id;
      } else {
        const id = crypto.randomUUID();
        const record: ComBriefing = {
          id,
          event_id: eventId,
          updated_at: nowIso,
          ...patch,
        } as ComBriefing;
        setBriefing(record);
        const { error } = await client.from("com_briefings").insert({
          id,
          event_id: eventId,
          overview: patch.overview ?? null,
          comms_plan: patch.comms_plan ?? null,
          safety_notes: patch.safety_notes ?? null,
          updates: patch.updates ?? null,
          updated_at: nowIso,
        });
        if (error)
          console.warn("[useCommsData] insert com_briefings failed", error);
        return id;
      }
    },
    [briefing, eventId],
  );

  // Alerts CRUD
  const createAlert = React.useCallback(
    async (input: { direction: string; description: string; id?: string }) => {
      const id = input.id ?? crypto.randomUUID();
      const nowIso = new Date().toISOString();
      const record: ComAlert = {
        id,
        event_id: eventId,
        direction: input.direction,
        description: input.description,
        updated_at: nowIso,
      };
      setAlerts((prev) => [...prev, record]);
      try {
        const client = clientRef.current ?? getSupabaseBrowserClient();
        const { error } = await client.from("com_alerts").insert({
          id,
          event_id: eventId,
          direction: input.direction,
          description: input.description,
          updated_at: nowIso,
        });
        if (error)
          console.warn("[useCommsData] insert com_alerts failed", error);
      } catch (e) {
        console.warn("[useCommsData] insert com_alerts error", e);
      }
      return id;
    },
    [eventId],
  );

  const updateAlert = React.useCallback(
    async (
      id: string,
      patch: Partial<Pick<ComAlert, "direction" | "description">>,
    ) => {
      const nowIso = new Date().toISOString();
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, ...patch, updated_at: nowIso } : a,
        ),
      );
      try {
        const client = clientRef.current ?? getSupabaseBrowserClient();
        const payload: any = { ...patch, updated_at: nowIso };
        const { error } = await client
          .from("com_alerts")
          .update(payload)
          .eq("id", id);
        if (error)
          console.warn("[useCommsData] update com_alerts failed", error);
      } catch (e) {
        console.warn("[useCommsData] update com_alerts error", e);
      }
    },
    [],
  );

  const deleteAlert = React.useCallback(async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      const client = clientRef.current ?? getSupabaseBrowserClient();
      const { error } = await client.from("com_alerts").delete().eq("id", id);
      if (error) console.warn("[useCommsData] delete com_alerts failed", error);
    } catch (e) {
      console.warn("[useCommsData] delete com_alerts error", e);
    }
  }, []);

  return {
    teams,
    operators,
    logs,
    channels,
    briefing,
    alerts,
    globalCheckInMinutes,
    setGlobalCheckInMinutes,
    addLog,
    checkInTeam,
    checkInOperator,
    createTeam,
    updateTeam,
    deleteTeam,
    upsertBriefing,
    createAlert,
    updateAlert,
    deleteAlert,
  } as const;
}
