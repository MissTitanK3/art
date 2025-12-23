"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@workspace/ui/primitives";
import { toast } from "@workspace/ui/primitives/sonner";
import { formatLocalDateTime } from "@workspace/store/useRegionResponseStore";
import { clearIntakeDraftPersistenceById, generateIntakeDraftId, initializeIntakeDraft } from "@workspace/store/useIntakeDraftStore";
import { useIntakeDraftIndexStore } from "@workspace/store/useIntakeDraftIndexStore";
import { ArrowLeft } from "lucide-react";

export default function IntakeIndexPage() {
  const router = useRouter();
  const drafts = useIntakeDraftIndexStore((state) => state.drafts);
  const upsertDraft = useIntakeDraftIndexStore((state) => state.upsertDraft);
  const removeDraft = useIntakeDraftIndexStore((state) => state.removeDraft);

  const handleStart = async () => {
    const id = generateIntakeDraftId();
    const now = new Date().toISOString();
    await initializeIntakeDraft(id, { lastUpdatedAt: now });
    upsertDraft({ id, caseRef: "Pending", lastUpdatedAt: now, createdAt: now, status: "wip" });
    router.push(`/intake/${id}`);
  };

  const handleOpen = (id: string) => {
    router.push(`/intake/${id}`);
  };

  const handleClear = async (id: string) => {
    await clearIntakeDraftPersistenceById(id);
    removeDraft(id);
    toast.success("WIP cleared");
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <div className="space-y-3 pt-2">
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </Link>
        </Button>
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
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-xl border bg-background p-4">
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
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Created: {formatLocalDateTime(draft.createdAt)}</p>
                      <p>Last updated: {formatLocalDateTime(draft.lastUpdatedAt)}</p>
                      {draft.submittedAt ? <p>Submitted: {formatLocalDateTime(draft.submittedAt)}</p> : null}
                    </div>
                  </div>
                  <div className="flex w-full justify-evenly gap-2">
                    <Button size="sm" className="h-9" onClick={() => handleOpen(draft.id)}>
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9"
                      onClick={() => handleClear(draft.id)}
                    >
                      Clear WIP
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
