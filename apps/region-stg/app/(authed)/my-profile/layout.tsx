"use client";

import type { PropsWithChildren } from "react";
import { ProfileStoreProvider } from "@/providers/ProfileStoreProvider";

export default function MyProfileLayout({ children }: PropsWithChildren) {
  return <ProfileStoreProvider>{children}</ProfileStoreProvider>;
}
