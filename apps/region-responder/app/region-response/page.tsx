"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@workspace/ui/primitives";
import { toast } from "@workspace/ui/primitives/sonner";
import {
  formatLocalDateTime,
  getSessionsList,
  useRegionResponseStore,
} from "@workspace/store/useRegionResponseStore";
import { ArrowLeft } from "lucide-react";

export default function RegionResponseIndexPage() {
  const router = useRouter();
  const sessions = useRegionResponseStore((state) => state.sessions);
  const activeId = useRegionResponseStore((state) => state.activeId);
  const startSession = useRegionResponseStore((state) => state.startSession);
  const setActive = useRegionResponseStore((state) => state.setActive);
  const clearSession = useRegionResponseStore((state) => state.clearSession);

  const list = useMemo(() => getSessionsList(sessions), [sessions]);

  const handleStart = () => {
    const session = startSession();
    toast.success(`Response started (${session.responseRef})`);
    router.push(`/region-response/${session.id}`);
  };

  const handleOpen = (id: string) => {
    setActive(id);
    router.push(`/region-response/${id}`);
  };

  const handleClear = async (id: string) => {
    await clearSession(id);
    toast.success("Response cleared");
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <div>
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link href="/intake" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </Link>
        </Button>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Region Response</p>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">Start or continue a response</h1>
        <p className="text-sm text-muted-foreground">
          Launch a new response, or reopen a previous one to review history and export a dispatcher-ready summary.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="h-12" onClick={handleStart}>
            Start Region Response
          </Button>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Saved responses</p>
            <p className="text-sm text-muted-foreground">All responses are stored locally for offline access.</p>
          </div>
        </div>

        {!list.length ? (
          <p className="text-sm text-muted-foreground">No responses yet. Start one to begin logging.</p>
        ) : (
          <div className="space-y-3">
            {list.map((session) => (
              <div key={session.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-col items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="h-7 rounded-full px-3">
                        {session.responseRef}
                      </Badge>
                      {activeId === session.id ? (
                        <Badge variant="secondary" className="h-7 rounded-full px-3">
                          Active
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Started: {formatLocalDateTime(session.startedAt)}</p>
                      <p>Last updated: {formatLocalDateTime(session.lastUpdatedAt)}</p>
                      <p>
                        Entries: {session.checkIns.length} safety checks · {session.situationUpdates.length} situation updates
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full justify-evenly">
                    <Button size="sm" className="h-9" onClick={() => handleOpen(session.id)}>
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9"
                      onClick={() => handleClear(session.id)}
                    >
                      Clear
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
