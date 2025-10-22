// apps/region-template/components/dataLayer/dispatches/DispatchSubmissionDataLayer.tsx
"use client";

import * as React from "react";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { usePodStore } from "@/providers/PodStoreProvider";
import { DispatchSubmissionLayout } from "@workspace/ui/layout/dispatch/DispatchSubmissionLayout";
import { DispatchSubmission } from "@workspace/store/types/global.ts";

type Props = {
  id: string;
};

async function fetchDispatchSubmissionFromDatabase(id: string): Promise<DispatchSubmission | null> {
  console.log("Fetching dispatch submission from database for id:", id);

  // TODO: replace with actual persistence layer.
  // Example:
  // const { data } = await client.from("dispatch_submissions").select("*").eq("id", id).single();
  // if (!data) return null;
  // return transformToDispatchSubmission(data);
  await Promise.resolve();
  return null;
}

export default function DispatchSubmissionDataLayer({ id }: Props) {
  const storeSubmission = useDispatchStore((s) => s.submissions.find((sub) => sub.id === id));
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);
  const addUpdate = useDispatchStore((s) => s.addUpdate);
  const editUpdate = useDispatchStore((s) => s.editUpdate);
  const removeUpdate = useDispatchStore((s) => s.removeUpdate);
  const roster = usePodStore((s) => s.activeRoster);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!id) {
        return;
      }

      setLoading(true);
      try {
        const result = await fetchDispatchSubmissionFromDatabase(id);
        if (!cancelled && result) {
          updateSubmission(result.id, result);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("DispatchSubmissionDataLayer: failed to fetch submission", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [id, updateSubmission]);

  const submission = storeSubmission;

  if (!submission) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Dispatch not found.</p>
      </div>
    );
  }

  return (
    <DispatchSubmissionLayout
      submission={submission}
      loadingMessage={loading ? "Loading latest dispatch details..." : undefined}
      onUpdateSubmission={(patch) => updateSubmission(submission.id, patch)}
      onAddUpdate={(update) => addUpdate(submission.id, update)}
      onEditUpdate={(updateId, text) => editUpdate(submission.id, updateId, text)}
      onRemoveUpdate={(updateId) => removeUpdate(submission.id, updateId)}
      roster={roster}
    />
  );
}
