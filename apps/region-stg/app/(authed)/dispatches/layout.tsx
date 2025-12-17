import type { ReactNode } from "react";
import { requireDispatchAccess } from "@/lib/guards";
import DispatchesClientLayout from "./providers.client";

export default async function DispatchesLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDispatchAccess();
  return <DispatchesClientLayout>{children}</DispatchesClientLayout>;
}
