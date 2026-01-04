"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { usePodStore } from "@/providers/PodStoreProvider";
import { DispatchSubmissionLayout } from "@workspace/ui/layout/dispatch/dispatch-submission-layout";
import { DispatchSubmission } from "@workspace/store/types/global.ts";
import { mapRowToSubmission } from "@workspace/ui/hooks/map-row-to-submission";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type {
  DispatchAttachment,
  DispatchUpdate,
  LogisticsItem,
} from "@workspace/store/types/dispatch";
import type { DispatchUpdateDraft } from "@workspace/ui/patterns/features/updates/dispatch-updates";
import { useCommsData } from "@/hooks/useCommsData";
import { CommsDashboardView } from "@workspace/ui/patterns/features/dispatch/comms-dashboard-view";
async function fetchDispatchSubmissionFromDatabase(
  id: string,
): Promise<DispatchSubmission | null> {
  try {
    const res = await fetch(`/api/dispatches/${id}`);
    if (!res.ok) {
      console.warn("[DispatchSubmissionDataLayer] fetch error", res.status);
      return null;
    }
    const json = await res.json();
    return json?.submission ? mapRowToSubmission(json.submission) : null;
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] fetch error", e);
    return null;
  }
}
async function fetchSubmissionUpdates(id: string): Promise<DispatchUpdate[]> {
  try {
    const res = await fetch(`/api/dispatches/${id}/updates`);
    if (!res.ok) {
      console.warn(
        "[DispatchSubmissionDataLayer] fetch updates error",
        res.status,
      );
      return [];
    }
    const json = await res.json();
    return json.updates as DispatchUpdate[];
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] fetch updates error", e);
    return [];
  }
}
async function fetchSubmissionLogistics(id: string): Promise<LogisticsItem[]> {
  try {
    const res = await fetch(`/api/dispatches/${id}/logistics`);
    if (!res.ok) {
      console.warn(
        "[DispatchSubmissionDataLayer] fetch logistics error",
        res.status,
      );
      return [];
    }
    const json = await res.json();
    return json.logistics as LogisticsItem[];
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] fetch logistics error", e);
    return [];
  }
}
async function persistSubmissionPatchToDatabase(
  id: string,
  patch: Partial<DispatchSubmission>,
): Promise<void> {
  // Send patch to API
  try {
    const res = await fetch(`/api/dispatches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      console.warn("[DispatchSubmissionDataLayer] PATCH error", res.status);
    }
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] PATCH error", e);
  }
}
async function insertUpdateRow(
  dispatchId: string,
  update: DispatchUpdate,
): Promise<void> {
  try {
    const res = await fetch(`/api/dispatches/${dispatchId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!res.ok) {
      console.warn(
        "[DispatchSubmissionDataLayer] insert update error",
        res.status,
      );
    }
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] insert update error", e);
  }
}

async function uploadUpdateAttachments(
  dispatchId: string,
  updateId: string,
  files: File[],
): Promise<DispatchAttachment[]> {
  const client = getSupabaseBrowserClient();
  const bucket = client.storage.from("media");
  const uploads = await Promise.all(
    files.map(async (file) => {
      try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const attachmentId = crypto.randomUUID();
        const filename = `${attachmentId}.${ext}`;
        const path = `dispatches/${dispatchId}/updates/${updateId}/${filename}`;
        const { error } = await bucket.upload(path, file, {
          upsert: false,
          cacheControl: "3600",
        });
        if (error) return null;
        const { data } = bucket.getPublicUrl(path);
        if (!data?.publicUrl) return null;
        return {
          id: attachmentId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: data.publicUrl,
        };
      } catch {
        return null;
      }
    }),
  );
  return uploads.filter(
    (u): u is DispatchAttachment => u !== null,
  );
}
async function updateUpdateRow(updateId: string, text: string): Promise<void> {
  try {
    const res = await fetch(`/api/dispatches/updates/${updateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.warn(
        "[DispatchSubmissionDataLayer] update update error",
        res.status,
      );
    }
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] update update error", e);
  }
}
async function deleteUpdateRow(updateId: string): Promise<void> {
  try {
    const res = await fetch(`/api/dispatches/updates/${updateId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn(
        "[DispatchSubmissionDataLayer] delete update error",
        res.status,
      );
    }
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] delete update error", e);
  }
}
async function persistLogisticsDiff(
  dispatchId: string,
  prevItems: LogisticsItem[],
  nextItems: LogisticsItem[],
): Promise<void> {
  try {
    const res = await fetch(`/api/dispatches/${dispatchId}/logistics`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextItems }),
    });
    if (!res.ok) {
      console.warn(
        "[DispatchSubmissionDataLayer] logistics diff error",
        res.status,
      );
    }
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] logistics diff error", e);
  }
}
export default function DispatchSubmissionPage() {
  const params = useParams<{
    id: string;
  }>();
  const id = params.id;
  // Comms data for the Radio Comms tab
  const commsData = useCommsData({ eventId: id });
  const storeSubmission = useDispatchStore((s) =>
    s.submissions.find((sub) => sub.id === id),
  );
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);
  const addSubmission = useDispatchStore((s) => s.addSubmission);
  const fetchedRef = useRef<string | null>(null);
  const roster = usePodStore((s) => s.activeRoster);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      // Prevent refetch loops when the local store updates
      if (fetchedRef.current === id) return;
      fetchedRef.current = id;
      if (!id) {
        return;
      }
      setLoading(true);
      try {
        const result = await fetchDispatchSubmissionFromDatabase(id);
        if (!cancelled && result) {
          // hydrate related updates + logistics
          const [updates, logistics] = await Promise.all([
            fetchSubmissionUpdates(id),
            fetchSubmissionLogistics(id),
          ]);
          const hydrated: DispatchSubmission = {
            ...result,
            updates,
            logistics,
          } as DispatchSubmission;
          // If the submission is not yet in the local store, add it; otherwise update it.
          if (!storeSubmission) {
            addSubmission(hydrated);
          } else {
            updateSubmission(hydrated.id, hydrated);
          }
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "DispatchSubmissionDataLayer: failed to fetch submission",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
      setLoading(false);
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [id, updateSubmission, addSubmission, storeSubmission]);
  const submission = storeSubmission;
  if (!submission) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Dispatch not found.</p>
      </div>
    );
  }
  // Handlers: persist to DB then update local store
  const handleUpdateSubmission = async (patch: Partial<DispatchSubmission>) => {
    // Persist core submission fields
    try {
      await persistSubmissionPatchToDatabase(submission.id, patch);
    } catch (e) {
      // already logged
    }
    // Persist logistics if present by diffing
    if (patch.logistics) {
      const prev = submission.logistics ?? [];
      const next = patch.logistics ?? [];
      try {
        await persistLogisticsDiff(submission.id, prev, next);
      } catch (e) {
        // already logged
      }
    }
    updateSubmission(submission.id, patch);
  };
  const handleAddUpdate = async (u: DispatchUpdateDraft) => {
    const updateId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    let attachments = u.attachments ?? [];
    if (u.files?.length) {
      attachments = await uploadUpdateAttachments(
        submission.id,
        updateId,
        u.files,
      );
    }
    const newUpdate: DispatchUpdate = {
      id: updateId,
      createdAt,
      attachments,
      author: u.author,
      text: u.text,
    };
    try {
      await insertUpdateRow(submission.id, newUpdate);
    } catch (e) {
      // already logged
    }
    // Update local store by patching updates array
    const nextUpdates = [...(submission.updates ?? []), newUpdate];
    updateSubmission(submission.id, { updates: nextUpdates });
  };
  const handleEditUpdate = async (updateId: string, text: string) => {
    try {
      await updateUpdateRow(updateId, text);
    } catch (e) {
      // already logged
    }
    const nextUpdates = (submission.updates ?? []).map((u) =>
      u.id === updateId ? { ...u, text } : u,
    );
    updateSubmission(submission.id, { updates: nextUpdates });
  };
  const handleRemoveUpdate = async (updateId: string) => {
    try {
      await deleteUpdateRow(updateId);
    } catch (e) {
      // already logged
    }
    const nextUpdates = (submission.updates ?? []).filter(
      (u) => u.id !== updateId,
    );
    updateSubmission(submission.id, { updates: nextUpdates });
  };
  return (
    <div suppressHydrationWarning>
      <DispatchSubmissionLayout
        submission={submission}
        loadingMessage={
          loading ? "Loading latest dispatch details..." : undefined
        }
        onUpdateSubmission={handleUpdateSubmission}
        onAddUpdate={handleAddUpdate}
        onEditUpdate={handleEditUpdate}
        onRemoveUpdate={handleRemoveUpdate}
        roster={roster}
        commsTabContent={
          <CommsDashboardView
            teams={commsData.teams}
            logs={commsData.logs}
            channels={commsData.channels}
            briefing={commsData.briefing}
            alerts={commsData.alerts}
            globalCheckInMinutes={commsData.globalCheckInMinutes}
            setGlobalCheckInMinutes={commsData.setGlobalCheckInMinutes}
            addLog={commsData.addLog}
            checkInTeam={commsData.checkInTeam}
            createTeam={commsData.createTeam}
            updateTeam={commsData.updateTeam}
            deleteTeam={commsData.deleteTeam}
            upsertBriefing={commsData.upsertBriefing as any}
            createAlert={commsData.createAlert}
            updateAlert={commsData.updateAlert as any}
            deleteAlert={commsData.deleteAlert}
          />
        }
        commsTabLabel="Radio Comms"
      />
    </div>
  );
}
