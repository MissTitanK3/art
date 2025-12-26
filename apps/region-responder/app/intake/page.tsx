"use client";

import { useEffect, useState } from "react";
import { Badge, Button } from "@workspace/ui/primitives";
import { toast } from "@workspace/ui/primitives/sonner";
import { formatLocalDateTime } from "@workspace/store/useRegionResponseStore";
import { clearIntakeDraftPersistenceById, generateIntakeDraftId, initializeIntakeDraft } from "@workspace/store/useIntakeDraftStore";
import { useIntakeDraftIndexStore } from "@workspace/store/useIntakeDraftIndexStore";
import { IntakeDetail } from "./intake-detail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/primitives/alert-dialog";

export default function IntakeIndexPage() {
  const drafts = useIntakeDraftIndexStore((state) => state.drafts);
  const upsertDraft = useIntakeDraftIndexStore((state) => state.upsertDraft);
  const removeDraft = useIntakeDraftIndexStore((state) => state.removeDraft);

  const [selectedId, setSelectedId] = useState<string>("");
  const [showListView, setShowListView] = useState(true);
  const [pendingClearId, setPendingClearId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!selectedId && drafts.length) {
      setSelectedId(drafts[0]?.id ?? "");
    }
  }, [drafts, selectedId]);

  const handleCloseDetail = () => {
    setShowListView(true);
  };

  const handleStart = async () => {
    const id = generateIntakeDraftId();
    const now = new Date().toISOString();
    await initializeIntakeDraft(id, { lastUpdatedAt: now });
    upsertDraft({ id, caseRef: "Pending", lastUpdatedAt: now, createdAt: now, status: "wip", fullName: "" });
    setSelectedId(id);
    setShowListView(false);
  };

  const handleRequestClear = (id: string) => {
    setPendingClearId(id);
  };

  const handleConfirmClear = async () => {
    if (!pendingClearId || clearing) return;
    setClearing(true);
    try {
      await clearIntakeDraftPersistenceById(pendingClearId);
      removeDraft(pendingClearId);
      toast.success("WIP cleared");
      setSelectedId((current) => {
        if (current === pendingClearId) {
          setShowListView(true);
          return "";
        }
        return current;
      });
      setPendingClearId(null);
    } catch (error) {
      console.error("Failed to clear intake WIP", error);
      toast.error("Unable to clear this WIP. Try again.");
    } finally {
      setClearing(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowListView(false);
  };

  const showDetail = Boolean(selectedId && !showListView);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
      {showDetail ? (
        <IntakeDetail draftId={selectedId} onBack={handleCloseDetail} />
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intake</p>
            <h1 className="text-2xl font-semibold leading-tight text-foreground">Start or resume an intake</h1>
            <p className="text-sm text-muted-foreground">
              Create separate WIPs for each person. Mark as submitted once it is final. Everything stays on this device until you share.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" className="h-12" onClick={handleStart}>
                Start New Intake
              </Button>
            </div>
          </div>

          <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Saved WIPs</p>
                <p className="text-sm text-muted-foreground">Stored locally for offline work.</p>
              </div>
            </div>

            {!drafts.length ? (
              <p className="text-sm text-muted-foreground">No WIPs yet. Start a new intake to begin.</p>
            ) : (
              <div className="space-y-3">
                {drafts.map((draft) => {
                  const isSelected = selectedId === draft.id;
                  const displayName = draft.fullName?.trim() || "Name unknown";
                  return (
                    <div
                      key={draft.id}
                      className={`rounded-xl border bg-background p-4 ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex flex-col items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="h-7 rounded-full px-3">
                              {draft.caseRef || draft.id}
                            </Badge>
                            <Badge variant={draft.status === "submitted" ? "success" : "secondary"} className="h-7 rounded-full px-3">
                              {draft.status === "submitted" ? "Submitted" : "WIP"}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-foreground">Name: {displayName}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Created: {formatLocalDateTime(draft.createdAt)}</p>
                            <p>Last updated: {formatLocalDateTime(draft.lastUpdatedAt)}</p>
                            {draft.submittedAt ? <p>Submitted: {formatLocalDateTime(draft.submittedAt)}</p> : null}
                          </div>
                        </div>
                        <div className="flex w-full justify-evenly gap-2">
                          <Button size="sm" className="h-9" onClick={() => handleSelect(draft.id)}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9"
                            onClick={() => handleRequestClear(draft.id)}
                          >
                            Clear WIP
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <AlertDialog open={Boolean(pendingClearId)} onOpenChange={(open) => setPendingClearId(open ? pendingClearId : null)}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this WIP?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the local copy of Case Ref {drafts.find((d) => d.id === pendingClearId)?.caseRef || pendingClearId} (Name:{" "}
              {drafts.find((d) => d.id === pendingClearId)?.fullName?.trim() || "Name unknown"}). You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus disabled={clearing} onClick={() => setPendingClearId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={clearing}
              onClick={handleConfirmClear}
            >
              {clearing ? "Clearing..." : "Yes, delete WIP"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
