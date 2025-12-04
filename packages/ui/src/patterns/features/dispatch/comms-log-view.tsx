"use client";
import { useState } from "react";
import type {
  ComLog,
  CommsImportance,
  CommsMessageType,
} from "@workspace/store/types/comms.ts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  CommsImportanceSelect,
  CommsTypeSelect,
} from "@workspace/ui/patterns/features/dispatch/comms-selects";
type Props = {
  logs: ComLog[];
  onAddLog: (log: {
    message: string;
    message_type: CommsMessageType;
    importance: CommsImportance;
    timestamp?: string;
    tags?: string[];
    operator_id?: string | null;
    incident_id?: string | null;
  }) => void;
};
export function CommsLogView({ logs, onAddLog }: Props) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<CommsMessageType>("Routine");
  const [importance, setImportance] = useState<CommsImportance>("Normal");
  const submit = () => {
    if (!message.trim()) return;
    onAddLog({
      message: message.trim(),
      message_type: type,
      importance,
      tags: [],
    });
    setMessage("");
  };
  return (
    <div className="grid h-full grid-rows-[auto,1fr] gap-3">
      <Card>
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 md:flex-row md:items-center w-full md:gap-4">
            <span>Importance:</span>
            <CommsTypeSelect
              value={type}
              onChange={setType}
              className="w-full md:w-[160px]"
            />
            <span>Priority:</span>
            <CommsImportanceSelect
              value={importance}
              onChange={setImportance}
              className="w-full md:w-[160px]"
            />
          </div>
          <div className="mt-2 grid gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Log message..."
            />
            <Button onClick={submit} className="self-start">
              Add Log
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="overflow-y-auto rounded-md border p-2 text-sm">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No log entries yet.</p>
        ) : (
          logs
            .slice()
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .map((l) => (
              <div key={l.id} className="border-b py-2 last:border-b-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(l.timestamp).toLocaleTimeString()} ·{" "}
                    {l.message_type} · {l.importance}
                  </span>
                </div>
                <div className="mt-1">{l.message}</div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
export default CommsLogView;
