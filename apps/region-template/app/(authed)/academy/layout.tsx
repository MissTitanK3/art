"use client";

import type { PropsWithChildren } from "react";
import { PodStoreProvider } from "@/providers/PodStoreProvider";

export default function AcademyLayout({ children }: PropsWithChildren) {
  return <PodStoreProvider>{children}</PodStoreProvider>;
}
