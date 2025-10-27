// apps/region-pnw/providers/RegionProvider.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import { demoProfileAdapter } from "../lib/adapters/profile/demoProfileAdapter";
import { supabaseProfileAdapter } from "../lib/adapters/profile/supabaseProfileAdapter";
import { getAuthProviderId } from "@/lib/auth/adapter";

const RegionContext = createContext({ profileAdapter: demoProfileAdapter });

export function RegionProvider({ children }: { children: React.ReactNode }) {
  // Choose data adapter based on auth provider to stay consistent
  const profileAdapter = useMemo(() => {
    const provider = getAuthProviderId();
    return provider === "supabase" ? supabaseProfileAdapter : demoProfileAdapter;
  }, []);

  return (
    <RegionContext.Provider value={{ profileAdapter }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionAdapters() {
  return useContext(RegionContext);
}
