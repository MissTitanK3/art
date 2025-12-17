"use client";

import { PropsWithChildren, createContext, useContext, useRef } from "react";
import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

import {
  type AcademyDashboardStoreState,
  type CreateAcademyDashboardStoreOptions,
  createAcademyDashboardStore,
} from "@workspace/store/useAcademyDashboardStore";

type PodAcademyDashboardStoreProviderProps =
  PropsWithChildren<CreateAcademyDashboardStoreOptions>;

export const PodAcademyDashboardStoreContext =
  createContext<StoreApi<AcademyDashboardStoreState> | null>(null);

export function PodAcademyDashboardStoreProvider({
  children,
  persist = false,
  storageKey = `pod-academy-dashboard-store:${process.env.NEXT_PUBLIC_BRAND_NAME}`,
  initialStats,
  initialCourseGroups,
  initialMembers,
  initialInstructors,
  initialTrainingClasses,
  initialSessions,
}: PodAcademyDashboardStoreProviderProps) {
  const storeRef = useRef<StoreApi<AcademyDashboardStoreState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createAcademyDashboardStore({
      initialStats,
      initialCourseGroups,
      initialMembers,
      initialInstructors,
      initialTrainingClasses,
      initialSessions,
      persist,
      storageKey,
    });
  } else {
    const currentState = storeRef.current.getState();
    const hasInstructorActions =
      typeof (currentState as Partial<AcademyDashboardStoreState>)
        .addInstructor === "function" &&
      typeof (currentState as Partial<AcademyDashboardStoreState>)
        .updateInstructor === "function" &&
      typeof (currentState as Partial<AcademyDashboardStoreState>)
        .removeInstructor === "function";

    if (!hasInstructorActions) {
      storeRef.current = createAcademyDashboardStore({
        initialStats: currentState.stats ?? initialStats,
        initialCourseGroups: currentState.courseGroups ?? initialCourseGroups,
        initialMembers: currentState.members ?? initialMembers,
        initialInstructors: currentState.instructors ?? initialInstructors,
        initialTrainingClasses:
          currentState.trainingClasses ?? initialTrainingClasses,
        initialSessions: currentState.sessions ?? initialSessions,
        persist,
        storageKey,
      });
    }
  }

  return (
    <PodAcademyDashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </PodAcademyDashboardStoreContext.Provider>
  );
}

export function usePodAcademyDashboardStore<T>(
  selector: (state: AcademyDashboardStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  const store = useContext(PodAcademyDashboardStoreContext);

  if (!store) {
    throw new Error(
      "usePodAcademyDashboardStore must be used within a PodAcademyDashboardStoreProvider",
    );
  }

  return equalityFn
    ? useStoreWithEqualityFn(store, selector, equalityFn)
    : useStore(store, selector);
}
