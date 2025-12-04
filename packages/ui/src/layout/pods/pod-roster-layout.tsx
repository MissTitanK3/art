import { Button } from "@workspace/ui/primitives/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/primitives/sheet";
import { RosterCardList } from "@workspace/ui/patterns/features/roster/roster-card-list";
import { EditRosterEntryForm } from "@workspace/ui/patterns/features/roster/roster-entry-editor";
import {
  ROSTER_EDITOR_SECTION_META,
  type RosterEditorSection,
} from "@workspace/ui/patterns/features/roster/types";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
export type PodRosterLayoutProps = {
  podSlug: string;
  podId?: string;
  podName?: string;
  rows: RosterEntry[];
  editingEntry: RosterEntry | null;
  editingSection: RosterEditorSection | null;
  onEdit: (id: string, section: RosterEditorSection) => void;
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
  editingSection,
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
    return (
      <section className="mx-auto w-full max-w-4xl">{notFoundMessage}</section>
    );
  }
  const rosterList =
    rows.length > 0 ? (
      <RosterCardList
        rows={rows}
        onEdit={onEdit}
        podName={podName ?? podSlug}
        onRemoveMember={onRemoveMember}
      />
    ) : (
      (emptyState ?? (
        <p className="mt-6 text-sm text-muted-foreground">
          No members yet. Add someone to get started.
        </p>
      ))
    );
  const sheetOpen = Boolean(editingEntry && editingSection);
  const activeSection: RosterEditorSection = editingSection ?? "details";
  const sectionMeta = ROSTER_EDITOR_SECTION_META[activeSection];
  const formId = `edit-roster-entry-${activeSection}-form`;
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

      <Sheet open={sheetOpen} onOpenChange={(next) => !next && onCloseEditor()}>
        <SheetContent
          side="right"
          className="flex max-w-none flex-col p-0 sm:w-[480px] md:w-[640px] lg:w-[720px] bg-accent text-accent-foreground"
        >
          <div className="border-b px-4 py-3">
            <SheetHeader>
              <SheetTitle>{sectionMeta.title}</SheetTitle>
              <SheetDescription>{sectionMeta.description}</SheetDescription>
            </SheetHeader>
          </div>

          {editingEntry ? (
            <div className="flex-1 overflow-y-auto p-4">
              <EditRosterEntryForm
                initial={editingEntry}
                onSave={onSaveEntry}
                section={activeSection}
                formId={formId}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button type="submit" form={formId} className="min-w-24">
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
export default PodRosterLayout;
