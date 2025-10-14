import React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { RosterCardList } from "@workspace/ui/components/client/roster/RosterCardList";
import { EditRosterEntryForm } from "@workspace/ui/components/client/roster/RosterEntryEditor";
import type { RosterEntry } from "@workspace/store/types/pod.ts";

export type PodRosterLayoutProps = {
  podSlug: string;
  podId?: string;
  podName?: string;
  rows: RosterEntry[];
  editingEntry: RosterEntry | null;
  onEdit: (id: string) => void;
  onCloseEditor: () => void;
  onSaveEntry: (entry: RosterEntry) => void;
  onRemoveMember: (memberId: string) => void;
  addMemberAction?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  notFoundMessage?: React.ReactNode;
  emptyState?: React.ReactNode;
};

export function PodRosterLayout({
  podSlug,
  podId,
  podName,
  rows,
  editingEntry,
  onEdit,
  onCloseEditor,
  onSaveEntry,
  onRemoveMember,
  addMemberAction,
  loadingMessage,
  notFoundMessage,
  emptyState,
}: PodRosterLayoutProps) {
  if (!podId && notFoundMessage) {
    return <section className="mx-auto w-full max-w-4xl">{notFoundMessage}</section>;
  }

  const rosterList = rows.length > 0 ? (
    <RosterCardList
      rows={rows}
      onEdit={onEdit}
      podName={podName ?? podSlug}
      onRemoveMember={onRemoveMember}
    />
  ) : (
    emptyState ?? (
      <p className="mt-6 text-sm text-muted-foreground">
        No members yet. Add someone to get started.
      </p>
    )
  );

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          Manage members for <span className="font-mono">{podSlug}</span>.
        </p>
        {addMemberAction}
      </div>

      {loadingMessage ? (
        <p className="mt-4 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}

      {rosterList}

      <Sheet open={Boolean(editingEntry)} onOpenChange={(next) => !next && onCloseEditor()}>
        <SheetContent
          side="right"
          className="flex max-w-none flex-col p-0 sm:w-[480px] md:w-[640px] lg:w-[720px] bg-accent text-accent-foreground"
        >
          <div className="border-b px-4 py-3">
            <SheetHeader>
              <SheetTitle>Edit Roster Entry</SheetTitle>
              <SheetDescription>
                Update role, status, languages and skills.
              </SheetDescription>
            </SheetHeader>
          </div>

          {editingEntry ? (
            <div className="flex-1 overflow-y-auto p-4">
              <EditRosterEntryForm initial={editingEntry} onSave={onSaveEntry} />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
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

export default PodRosterLayout;
