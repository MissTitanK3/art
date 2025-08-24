"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { usePodsStore } from "@workspace/store/podStore";
import { RosterTable } from "@workspace/ui/components/client/roster/RosterTable";
import { RosterEntry } from "@workspace/store/types/pod.ts";
import { EditRosterEntryForm } from '@workspace/ui/components/client/roster/RosterEntryEditor'

export default function PodRosterDataLayer() {
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");

  const { pods, updatePod } = usePodsStore();
  const pod = pods.find((p) => p.slug === podId);
  const rows = pod?.team ?? [];

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const editing = rows.find((r) => r.id === selectedId) ?? null;

  const handleSave = (entry: RosterEntry) => {
    if (!pod) return;
    updatePod(pod.id, {
      team: pod.team.map((r) => (r.id === entry.id ? entry : r)),
    });
    setSelectedId(null); // close sheet after save
  };

  return (
    <section className="mx-auto w-full max-w-4xl">
      <p className="mt-1 text-sm text-muted-foreground">
        Manage members for <span className="font-mono">{podId}</span>.
      </p>

      <RosterTable rows={rows} onEdit={(id) => setSelectedId(id)} />

      {/* Side panel editor */}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full sm:w-[480px] md:w-[640px] lg:w-[720px] max-w-none p-0 flex flex-col"
        >
          <div className="border-b px-4 py-3">
            <SheetHeader>
              <SheetTitle>Edit Roster Entry</SheetTitle>
              <SheetDescription>
                Update role, status, languages and skills.
              </SheetDescription>
            </SheetHeader>
          </div>

          {editing && (
            <div className="flex-1 overflow-y-auto p-4">
              <EditRosterEntryForm
                initial={editing}
                onSave={handleSave}
              />
            </div>
          )}

          <div className="border-t px-4 py-3 flex items-center justify-end gap-2">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button type="submit" form="edit-roster-entry-form" className="min-w-24">
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
