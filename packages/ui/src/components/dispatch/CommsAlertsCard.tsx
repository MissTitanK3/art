"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";

type Props = {
  onLog?: (entry: {
    message: string;
    message_type: "Routine" | "Priority" | "Emergency";
    importance: "Low" | "Normal" | "High";
  }) => void | Promise<void>;
  alerts?: { id: string; direction: string; description: string }[];
  onCreateAlert?: (input: {
    direction: string;
    description: string;
  }) => Promise<string> | string | void;
  onUpdateAlert?: (
    id: string,
    patch: Partial<{ direction: string; description: string }>,
  ) => Promise<void> | void;
  onDeleteAlert?: (id: string) => Promise<void> | void;
  storageKey?: string; // legacy localStorage fallback if CRUD not provided
};

type CustomAlert = { id: string; direction: string; description: string };

const EXAMPLES: CustomAlert[] = [
  {
    id: "ex-consolidate",
    direction: "Consolidate ×3",
    description: "Consolidate, Consolidate, Consolidate — {location}.",
  },
  {
    id: "ex-break",
    direction: "Break ×3 (urgent)",
    description: "Break, Break, Break — {location}.",
  },
  {
    id: "ex-silence",
    direction: "Radio silence",
    description: "All stations, radio silence — reason: {location}.",
  },
  {
    id: "ex-hail",
    direction: "Hailing format",
    description: "Recipient, this is {your_callsign}, over.",
  },
];

export function CommsAlertsCard({
  alerts: extAlerts,
  onCreateAlert,
  onUpdateAlert,
  onDeleteAlert,
  storageKey = "comms-alerts:default",
}: Props) {
  const [localAlerts, setLocalAlerts] = React.useState<CustomAlert[]>(EXAMPLES);
  const useExternal = Array.isArray(extAlerts);

  React.useEffect(() => {
    if (useExternal) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(storageKey)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CustomAlert[];
        if (Array.isArray(parsed)) setLocalAlerts(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, useExternal]);

  React.useEffect(() => {
    if (useExternal) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(localAlerts));
      }
    } catch {
      /* ignore */
    }
  }, [localAlerts, storageKey, useExternal]);

  const addAlert = async () => {
    if (useExternal && onCreateAlert) {
      await onCreateAlert({ direction: "", description: "" });
    } else {
      setLocalAlerts((prev) => [
        ...prev,
        { id: crypto.randomUUID(), direction: "", description: "" },
      ]);
    }
  };
  const removeAlert = async (id: string) => {
    if (useExternal && onDeleteAlert) {
      await onDeleteAlert(id);
    } else {
      setLocalAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };
  const updateAlert = async (id: string, patch: Partial<CustomAlert>) => {
    if (useExternal && onUpdateAlert) {
      await onUpdateAlert(id, patch);
    } else {
      setLocalAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      );
    }
  };
  const resetExamples = async () => {
    const exampleSet = EXAMPLES.map((e) => ({ ...e, id: crypto.randomUUID() }));
    if (
      useExternal &&
      onDeleteAlert &&
      onCreateAlert &&
      Array.isArray(extAlerts)
    ) {
      await Promise.all(extAlerts.map((a) => onDeleteAlert(a.id)));
      for (const ex of exampleSet) {
        await onCreateAlert({
          direction: ex.direction,
          description: ex.description,
        });
      }
    } else {
      setLocalAlerts(exampleSet);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Etiquette</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">Custom alerts</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={resetExamples}
                className="w-full sm:w-auto"
              >
                Reset to examples
              </Button>
              <Button size="sm" onClick={addAlert} className="w-full sm:w-auto">
                Add alert
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {(useExternal ? extAlerts! : localAlerts).map((a) => (
              <div key={a.id} className="rounded-md border p-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="grid gap-1">
                    <Label>Direction</Label>
                    <Input
                      placeholder="e.g., Consolidate ×3"
                      value={a.direction}
                      onChange={(e) =>
                        void updateAlert(a.id, { direction: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="e.g., Consolidate, Consolidate, Consolidate — {location}."
                      value={a.description}
                      onChange={(e) =>
                        void updateAlert(a.id, { description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 justify-end sm:justify-start">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void removeAlert(a.id)}
                    className="w-full sm:w-auto"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {(useExternal ? (extAlerts?.length ?? 0) : localAlerts.length) ===
              0 && (
              <p className="text-muted-foreground text-xs">
                No alerts yet. Click “Add alert” or “Reset to examples” to get
                started.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <p className="font-medium">Standard radio identification format</p>
          <p className="text-muted-foreground">
            To identify yourself on a radio, state the recipient’s call sign
            followed by “this is” and your own call sign, then “over”. For
            example: “Nighthawk, this is Drifter 23, over”. Use the recipient’s
            call sign first, then your call sign to make it clear who you are
            calling and who is doing the calling. In an event context, use your
            team’s established call signs and procedures for the specific
            situation.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            <li>Identify the recipient: state their call sign.</li>
            <li>Use “this is”: precede your call sign with “this is”.</li>
            <li>Identify yourself: state your team/individual call sign.</li>
            <li>End with “over”: indicates you are waiting for a response.</li>
          </ul>
        </div>

        <div className="grid gap-2">
          <p className="font-medium">Civilian VHF — do’s and don’ts</p>
          <div className="grid gap-1">
            <p className="font-semibold">Do’s</p>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              <li>
                Monitor Channel 16 when not actively talking on another channel.
              </li>
              <li>
                Hail on Channel 16, then switch immediately to a working channel
                to converse.
              </li>
              <li>
                Be clear and concise: speak slowly, use standard phrases, keep
                messages brief.
              </li>
              <li>
                Use proper terminology: “Roger”/“Copy that” to acknowledge;
                “Over” to yield; “Out” to end.
              </li>
              <li>
                Identify your vessel or party at the start and end of
                transmissions.
              </li>
              <li>
                Listen first: ensure the channel is clear before transmitting.
              </li>
              <li>
                Perform radio checks on a working channel with a specific
                station (e.g., a marina).
              </li>
            </ul>
          </div>
          <div className="grid gap-1">
            <p className="font-semibold">Don’ts</p>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              <li>
                Don’t use Channel 16 for casual chat; it’s for distress and
                hailing only.
              </li>
              <li>Don’t use profanity; transmissions are public.</li>
              <li>
                Don’t monopolize channels; keep transmissions short so others
                can use them.
              </li>
              <li>
                Don’t interrupt or talk over others, especially during distress
                traffic.
              </li>
              <li>
                Don’t say “Over and out”; they are contradictory—use one or the
                other appropriately.
              </li>
              <li>
                Don’t transmit false distress calls; it’s a serious offense.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CommsAlertsCard;
