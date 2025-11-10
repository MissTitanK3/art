"use client";

import * as React from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  ConfirmedWatchForm as UIConfirmedWatchForm,
  type ConfirmedWatchPayload,
} from "@workspace/ui/components/client/watch/ConfirmedWatchForm";
import { toast } from "sonner";

export default function ConfirmedWatchForm() {
  const { user } = useAuthContext();
  const onSubmit = React.useCallback(async (payload: ConfirmedWatchPayload) => {
    const res = await fetch("/api/confirmed-watch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }
    toast.success("Confirmed report submitted");
  }, []);
  return (
    <UIConfirmedWatchForm submittedBy={user?.id ?? null} onSubmit={onSubmit} />
  );
}
