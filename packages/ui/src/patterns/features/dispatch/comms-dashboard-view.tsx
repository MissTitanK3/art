"use client";

import * as React from "react";
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage";
import type {
  ComTeam,
  ComChannel,
  ComBriefing,
  ComLog,
  ComAlert,
} from "@workspace/store/types/comms.ts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/primitives/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/primitives/tabs";
import { Input } from "@workspace/ui/primitives/input";
import { Label } from "@workspace/ui/primitives/label";
import { Button } from "@workspace/ui/primitives/button";
import { CommsTeamList } from "@workspace/ui/patterns/features/dispatch/comms-team-list";
import { CommsTeamCheckInList } from "@workspace/ui/patterns/features/dispatch/comms-team-check-in-list";
import { CommsLogView } from "@workspace/ui/patterns/features/dispatch/comms-log-view";
import { CommsScratchpad } from "@workspace/ui/patterns/features/dispatch/comms-scratchpad";
import { CommsBriefing } from "@workspace/ui/patterns/features/dispatch/comms-briefing";
import { CommsAlertsCard } from "@workspace/ui/patterns/features/dispatch/comms-alerts-card";

const CHECK_IN_STORAGE_KEY = "comms.defaultCheckInMinutes";
const DEFAULT_CHECK_IN_MINUTES = 60;

const coerceMinutes = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0
      ? Math.round(parsed)
      : undefined;
  }
  return undefined;
};

type Props = {
  teams: ComTeam[];
  logs: ComLog[];
  channels: ComChannel[];
  briefing: ComBriefing | null;
  alerts: ComAlert[] | null | undefined;
  globalCheckInMinutes?: number;
  setGlobalCheckInMinutes: (n: number) => void;
  addLog: React.ComponentProps<typeof CommsLogView>["onAddLog"];
  checkInTeam: (id: string) => void | Promise<unknown>;
  createTeam?: (team: Omit<ComTeam, "id">) => void | Promise<unknown>;
  updateTeam?: (id: string, patch: Partial<ComTeam>) => void | Promise<void>;
  deleteTeam?: (id: string) => void | Promise<void>;
  upsertBriefing?: (patch: Partial<ComBriefing>) => void | Promise<void>;
  createAlert?: (input: {
    direction: string;
    description: string;
  }) => Promise<string> | string | void;
  updateAlert?: (
    id: string,
    patch: Partial<{ direction: string; description: string }>
  ) => Promise<void> | void;
  deleteAlert?: (id: string) => Promise<void> | void;
};

export function CommsDashboardView({
  teams,
  logs,
  channels,
  briefing,
  alerts,
  globalCheckInMinutes,
  setGlobalCheckInMinutes,
  addLog,
  checkInTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  upsertBriefing,
  createAlert,
  updateAlert,
  deleteAlert,
}: Props): React.ReactElement {
  const resolvedInitialMinutes = React.useMemo(() => {
    if (
      typeof globalCheckInMinutes === "number" &&
      Number.isFinite(globalCheckInMinutes) &&
      globalCheckInMinutes > 0
    ) {
      return globalCheckInMinutes;
    }
    return DEFAULT_CHECK_IN_MINUTES;
  }, [globalCheckInMinutes]);
  const [storedCheckInMinutes, setStoredCheckInMinutes] =
    useLocalStorage<number>(CHECK_IN_STORAGE_KEY, resolvedInitialMinutes, {
      debounceMs: 150,
      sync: true,
      serialize: (value) => String(value),
      deserialize: (raw) => coerceMinutes(raw) ?? resolvedInitialMinutes,
      migrate: (payload) => coerceMinutes(payload) ?? resolvedInitialMinutes,
    });

  const [checkInInput, setCheckInInput] = React.useState<string>(() =>
    String(resolvedInitialMinutes)
  );

  const persistGlobalCheckInMinutes = React.useCallback(
    (mins: number) => {
      const normalized = coerceMinutes(mins);
      if (!normalized) return;
      setCheckInInput(String(normalized));
      setStoredCheckInMinutes(normalized);
      setGlobalCheckInMinutes(normalized);
    },
    [setGlobalCheckInMinutes, setStoredCheckInMinutes]
  );

  const effectiveCheckInMinutes = React.useMemo(() => {
    const globalMinutes = coerceMinutes(globalCheckInMinutes);
    if (globalMinutes) return globalMinutes;
    const storedMinutes = coerceMinutes(storedCheckInMinutes);
    if (storedMinutes) return storedMinutes;
    return resolvedInitialMinutes;
  }, [globalCheckInMinutes, resolvedInitialMinutes, storedCheckInMinutes]);

  React.useEffect(() => {
    setCheckInInput((prev) => {
      const prevValue = coerceMinutes(prev);
      return prevValue === effectiveCheckInMinutes
        ? prev
        : String(effectiveCheckInMinutes);
    });
  }, [effectiveCheckInMinutes]);

  React.useEffect(() => {
    const globalMinutes = coerceMinutes(globalCheckInMinutes);
    if (globalMinutes) {
      if (storedCheckInMinutes !== globalMinutes) {
        setStoredCheckInMinutes(globalMinutes);
      }
      return;
    }
    setGlobalCheckInMinutes(effectiveCheckInMinutes);
  }, [
    effectiveCheckInMinutes,
    globalCheckInMinutes,
    setGlobalCheckInMinutes,
    setStoredCheckInMinutes,
    storedCheckInMinutes,
  ]);

  const applyGlobalInterval = () => {
    const next = coerceMinutes(checkInInput);
    if (next) persistGlobalCheckInMinutes(next);
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(320px,0.85fr)]">
      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <CommsTeamList
              teams={teams}
              channels={channels}
              onCreateTeam={createTeam}
              onUpdateTeam={updateTeam}
              onDeleteTeam={deleteTeam}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="w-full">Check In&rsquo;s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 space-y-3">
              <div className="text-center">
                <Label htmlFor="global-checkin" className="text-sm">
                  Default check-in (minutes)
                </Label>
              </div>
              <div className="flex items-end justify-center gap-2">
                <Input
                  id="global-checkin"
                  type="number"
                  min={5}
                  value={checkInInput}
                  onChange={(e) => setCheckInInput(e.target.value)}
                  className="h-8 w-24 text-center text-sm"
                />
                <Button
                  onClick={applyGlobalInterval}
                  size="sm"
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
            </div>
            <CommsTeamCheckInList
              teams={teams}
              defaultCheckInMinutes={
                globalCheckInMinutes ?? DEFAULT_CHECK_IN_MINUTES
              }
              checkInInput={checkInInput}
              setCheckInInput={setCheckInInput}
              setGlobalCheckInMinutes={persistGlobalCheckInMinutes}
              onCheckIn={checkInTeam}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Tabs defaultValue="log" className="flex h-full flex-col">
          <TabsList className="mb-2 flex w-full flex-nowrap gap-2 overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="log">Logs</TabsTrigger>
            <TabsTrigger value="scratch">Scratchpad</TabsTrigger>
          </TabsList>
          <TabsContent value="alerts" className="flex-1">
            <CommsAlertsCard
              alerts={alerts?.map((a) => ({
                id: a.id,
                direction: a.direction,
                description: a.description,
              }))}
              onCreateAlert={createAlert}
              onUpdateAlert={updateAlert}
              onDeleteAlert={deleteAlert}
            />
          </TabsContent>
          <TabsContent value="log" className="flex-1">
            <CommsLogView logs={logs} onAddLog={addLog} />
          </TabsContent>
          <TabsContent value="scratch" className="flex-1">
            <CommsScratchpad />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col">
        <CommsBriefing
          briefing={briefing}
          onSave={upsertBriefing}
          className="h-full"
        />
      </div>
    </div>
  );
}

export default CommsDashboardView;
