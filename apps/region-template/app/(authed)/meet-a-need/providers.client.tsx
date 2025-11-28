"use client";

import type { PropsWithChildren } from "react";
import { MeetANeedStoreProvider } from "@/providers/MeetANeedStoreProvider";

export default function MeetANeedClientLayout({ children }: PropsWithChildren) {
  return <MeetANeedStoreProvider>{children}</MeetANeedStoreProvider>;
}
