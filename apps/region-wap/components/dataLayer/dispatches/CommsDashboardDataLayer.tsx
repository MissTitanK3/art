"use client";

import * as React from "react";
import { CommsDashboardView } from "@workspace/ui/components/dispatch/CommsDashboardView";
import { useCommsData } from "@/components/dataLayer/dispatches/useCommsData";

type Props = {
  eventId: string;
};

export default function CommsDashboardDataLayer({ eventId }: Props) {
  const data = useCommsData({ eventId });
  return (
    <CommsDashboardView
      teams={data.teams}
      logs={data.logs}
      channels={data.channels}
      briefing={data.briefing}
      alerts={data.alerts}
      globalCheckInMinutes={data.globalCheckInMinutes}
      setGlobalCheckInMinutes={data.setGlobalCheckInMinutes}
      addLog={data.addLog}
      checkInTeam={data.checkInTeam}
      createTeam={data.createTeam}
      updateTeam={data.updateTeam}
      deleteTeam={data.deleteTeam}
      upsertBriefing={data.upsertBriefing as any}
      createAlert={data.createAlert}
      updateAlert={data.updateAlert as any}
      deleteAlert={data.deleteAlert}
    />
  );
}

