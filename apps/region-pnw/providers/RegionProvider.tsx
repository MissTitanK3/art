// apps/region-pnw/providers/RegionProvider.tsx
"use client";
import { createContext, useContext } from "react";
import { supabaseProfileAdapter } from "../lib/adapters/profile/supabaseProfileAdapter";

const RegionContext = createContext({ profileAdapter: supabaseProfileAdapter });

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const profileAdapter = supabaseProfileAdapter;

  return (
    <RegionContext.Provider value={{ profileAdapter }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionAdapters() {
  return useContext(RegionContext);
}
