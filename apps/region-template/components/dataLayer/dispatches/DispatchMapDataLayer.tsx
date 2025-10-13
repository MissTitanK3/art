"use client";

import * as React from "react";
import Link from "next/link";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import type { DispatchSubmission } from "@workspace/store/dispatchStore";
import { DispatchListLayout } from "@workspace/ui/layout/dispatch/DispatchListLayout";

async function fetchDispatchesFromDatabase(): Promise<DispatchSubmission[] | null> {
  // TODO: replace with actual persistence (e.g., Supabase, Hasura, REST).
  // Example:
  // const { data } = await client.from("dispatch_submissions").select("*");
  // return data?.map(transformToDispatchSubmission) ?? [];
  await Promise.resolve();
  return null;
}

export default function DispatchListDataLayer() {
  const submissions = useDispatchStore((s) => s.submissions);
  const [remoteSubmissions, setRemoteSubmissions] = React.useState<typeof submissions | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      try {
        const result = await fetchDispatchesFromDatabase();
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          setRemoteSubmissions(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("DispatchListDataLayer: failed to fetch dispatches", error);
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
  }, []);

  const data = remoteSubmissions ?? submissions;

  return (
    <DispatchListLayout
      submissions={data}
      LinkComponent={({ href, children }) => (
        <Link href={href} className="block hover:no-underline">
          {children}
        </Link>
      )}
      loadingState={loading ? (
        <p className="text-sm text-muted-foreground">Loading dispatch submissions...</p>
      ) : undefined}
    />
  );
}
