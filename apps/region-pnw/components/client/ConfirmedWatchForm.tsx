"use client";

import * as React from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { ConfirmedWatchForm as UIConfirmedWatchForm } from "@workspace/ui/components/client/watch/ConfirmedWatchForm";

export default function ConfirmedWatchForm() {
  const { user } = useAuthContext();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_WIZZARD || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WIZZARD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return (
    <UIConfirmedWatchForm
      submittedBy={user?.id ?? null}
      supabaseUrl={supabaseUrl || undefined}
      supabaseAnonKey={anonKey || undefined}
    />
  );
}

