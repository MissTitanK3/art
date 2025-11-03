"use client";

import * as React from "react";
import type {
  ComTeam,
  ComChannel,
  ComBriefing,
  ComLog,
  ComAlert,
} from "@workspace/store/types/comms.ts";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { CommsTeamList } from "@workspace/ui/components/dispatch/CommsTeamList";
import { CommsTeamCheckInList } from "@workspace/ui/components/dispatch/CommsTeamCheckInList";
import { CommsLogView } from "@workspace/ui/components/dispatch/CommsLogView";
import { CommsScratchpad } from "@workspace/ui/components/dispatch/CommsScratchpad";
import { CommsBriefing } from "@workspace/ui/components/dispatch/CommsBriefing";
import { CommsAlertsCard } from "@workspace/ui/components/dispatch/CommsAlertsCard";

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
  createTeam?: (team: Omit<ComTeam, 'id'>) => void | Promise<unknown>;
  updateTeam?: (id: string, patch: Partial<ComTeam>) => void | Promise<void>;
  deleteTeam?: (id: string) => void | Promise<void>;
  upsertBriefing?: (patch: Partial<ComBriefing>) => void | Promise<void>;
  createAlert?: (input: { direction: string; description: string }) => Promise<string> | string | void;
  updateAlert?: (id: string, patch: Partial<{ direction: string; description: string }>) => Promise<void> | void;
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
}: Props) {
  const [checkInInput, setCheckInInput] = React.useState<string>(
    (globalCheckInMinutes ?? 60).toString(),
  );

  const applyGlobalInterval = () => {
    const v = parseInt(checkInInput || "0", 10);
    if (Number.isFinite(v) && v > 0) setGlobalCheckInMinutes(v);
  };

  return (
    <div className="flex h-full w-full gap-3 flex-col xl:flex-row">
      <div className="flex w-full flex-col gap-3 xl:w-1/3">
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
            <CardTitle className="w-full">Check In's</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 space-y-3">
              <div className="text-center">
                <Label htmlFor="global-checkin" className="text-sm">Default check-in (minutes)</Label>
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
                <Button onClick={applyGlobalInterval} size="sm" variant="outline">
                  Apply
                </Button>
              </div>
            </div>
            <CommsTeamCheckInList
              teams={teams}
              defaultCheckInMinutes={globalCheckInMinutes ?? 60}
              checkInInput={checkInInput}
              setCheckInInput={setCheckInInput}
              setGlobalCheckInMinutes={setGlobalCheckInMinutes}
              onCheckIn={checkInTeam}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col gap-3 xl:w-2/3">
        <Tabs defaultValue="log" className="flex h-full flex-col">
          <TabsList className="mb-2 w-full overflow-x-auto flex flex-nowrap whitespace-nowrap gap-2">
            <TabsTrigger value="briefing">Briefing</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="log">Logs</TabsTrigger>
            <TabsTrigger value="scratch">Scratchpad</TabsTrigger>
          </TabsList>
          <TabsContent value="briefing" className="flex-1">
            <CommsBriefing briefing={briefing} onSave={upsertBriefing} />
          </TabsContent>
          <TabsContent value="alerts" className="flex-1">
            <CommsAlertsCard
              alerts={alerts?.map((a) => ({ id: a.id, direction: a.direction, description: a.description }))}
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
    </div>
  );
}

export default CommsDashboardView;
