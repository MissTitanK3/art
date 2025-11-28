"use client";

import * as React from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  ConfirmedWatchForm as UIConfirmedWatchForm,
  type ConfirmedWatchPayload,
} from "@workspace/ui/components/client/watch/ConfirmedWatchForm";
import { toast } from "@workspace/ui/components/sonner";

export default function ConfirmedWatchForm() {
  const { user } = useAuthContext();
  const disabledMessage =
    "Confirmed Watch submissions are disabled in this demo.";

  const onSubmit = React.useCallback(async (_payload: ConfirmedWatchPayload) => {
    toast.info(disabledMessage);
    // Surface an error to the form so it does not show success/reset
    throw new Error(disabledMessage);
  }, []);
  return (
    <UIConfirmedWatchForm submittedBy={user?.id ?? null} onSubmit={onSubmit} />
  );
}
