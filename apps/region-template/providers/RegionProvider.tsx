// apps/region-template/providers/RegionProvider.tsx
"use client";
import { createContext, useContext } from "react";
import { demoProfileAdapter } from "../lib/adapters/profile/demoProfileAdapter";

const RegionContext = createContext({ profileAdapter: demoProfileAdapter });

export function RegionProvider({ children }: { children: React.ReactNode }) {
  // later, swap in supabaseProfileAdapter or pocketProfileAdapter based on env
  return (
    <RegionContext.Provider value={{ profileAdapter: demoProfileAdapter }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionAdapters() {
  return useContext(RegionContext);
}
