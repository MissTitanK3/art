"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { CommsTeamList } from "./CommsTeamList";
import { CommsTeamCheckInList } from "./CommsTeamCheckInList";
import { CommsLogView } from "./CommsLogView";
import { CommsScratchpad } from "./CommsScratchpad";
import { CommsMap } from "./CommsMap";
import { CommsBriefing } from "./CommsBriefing";
import { CommsAlertsCard } from "./CommsAlertsCard";
import { useCommsData } from "./useCommsData";

type Props = {
  eventId: string;
};

export function CommsDashboard({ eventId }: Props) {
  const {
    teams,
    logs,
    channels,
    briefing,
    setGlobalCheckInMinutes,
    globalCheckInMinutes,
    addLog,
    checkInTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    upsertBriefing,
  } = useCommsData({ eventId });

  const [checkInInput, setCheckInInput] = React.useState<string>(
    globalCheckInMinutes?.toString() ?? "60",
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
              onCreateTeam={async (t) => { await createTeam(t as any); }}
              onUpdateTeam={async (id, patch) => { await updateTeam(id, patch as any); }}
              onDeleteTeam={async (id) => { await deleteTeam(id); }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="w-full">Check In's</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="grid flex-1 gap-1">
                <Label htmlFor="global-checkin">Default check-in (minutes)</Label>
                <Input
                  id="global-checkin"
                  type="number"
                  min={5}
                  value={checkInInput}
                  onChange={(e) => setCheckInInput(e.target.value)}
                />
              </div>
              <Button onClick={applyGlobalInterval} variant="outline" className="w-full sm:w-auto">
                Apply
              </Button>
            </div>
            <CommsTeamCheckInList
              teams={teams}
              defaultCheckInMinutes={globalCheckInMinutes ?? 60}
              onCheckIn={async (id) => { await checkInTeam(id); }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col gap-3 xl:w-2/3">
        <CommsBriefing briefing={briefing} onSave={async (patch) => { await upsertBriefing(patch as any); }} />
        <CommsAlertsCard onLog={(e) => addLog({ message: e.message, message_type: e.message_type, importance: e.importance })} />

        <Tabs defaultValue="log" className="flex h-full flex-col">
          <TabsList className="mb-2 w-full overflow-x-auto flex flex-wrap gap-2">
            <TabsTrigger value="log">Logs</TabsTrigger>
            <TabsTrigger value="scratch">Scratchpad</TabsTrigger>
          </TabsList>
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

export default CommsDashboard;
