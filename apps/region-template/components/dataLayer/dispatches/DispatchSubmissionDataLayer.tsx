// apps/region-template/components/dataLayer/dispatches/DispatchSubmissionDataLayer.tsx
"use client";

import * as React from "react";
import { useDispatchStore, type DispatchSubmission } from "@workspace/store/dispatchStore";
import { DispatchSubmissionLayout } from "@workspace/ui/layout/dispatch/DispatchSubmissionLayout";

type Props = {
  id: string;
};

async function fetchDispatchSubmissionFromDatabase(id: string): Promise<DispatchSubmission | null> {
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
  const [remoteSubmission, setRemoteSubmission] = React.useState<DispatchSubmission | null>(null);
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
          setRemoteSubmission(result);
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
  }, [id]);

  const submission = remoteSubmission ?? storeSubmission;

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
    />
  );
}
