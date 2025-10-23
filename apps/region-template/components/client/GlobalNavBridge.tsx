"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { navConfig } from "@/nav.config";
import { GlobalNav } from "./global-nav";

export function GlobalNavBridge({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const { session, status } = useAuth();

  const isAuthenticated = Boolean(session);
  const role = session?.user?.role ?? "guest";

  // wait until auth initialized
  if (status === "loading") return null;

  return (
    <GlobalNav
      config={navConfig}
      isAuthenticated={isAuthenticated}
      role={role}
      rightSlot={rightSlot}
    />
  );
}
