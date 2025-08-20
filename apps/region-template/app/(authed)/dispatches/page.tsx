"use client";
import { useEffect, useState } from "react";
import { MockApi } from "@/lib/mockApi";
import { useAppStore } from "@/lib/store";
import type { Dispatch } from "@/lib/types";

export default function DispatchesPage() {
  const [rows, setRows] = useState<Dispatch[]>([]);
  const pods = useAppStore(s => s.pods);
  const volunteers = useAppStore(s => s.volunteers);

  useEffect(() => { MockApi.listDispatches().then(setRows); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Dispatches</h1>
      <div className="grid gap-3">
        {rows.map(d => {
          const pod = pods[d.podId];
          return (
            <div key={d.id} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{pod?.name ?? "Unknown pod"}</div>
                <span className="text-xs px-2 py-0.5 rounded bg-muted">{d.status}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{d.summary ?? "—"}</div>
              <div className="mt-2 text-xs">Type: {d.type} • Opened: {new Date(d.openedAt).toLocaleString()}</div>
              {d.status === "open" && (
                <div className="mt-3 flex gap-2">
                  {Object.values(volunteers)
                    .filter(v => v.status === "active")
                    .slice(0, 4)
                    .map(v => (
                      <button
                        key={v.id}
                        className="border rounded px-2 py-1 text-xs"
                        onClick={async () => {
                          await MockApi.assignVolunteer(d.id, v);
                          const next = await MockApi.listDispatches();
                          setRows(next);
                        }}
                      >
                        Assign @{v.handle}
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
