import type { ReactNode } from "react";
import { requireLocalAdminAccess } from "@/lib/guards";
import SchedulesClientLayout from "./providers.client";

export default async function SchedulesLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLocalAdminAccess();
  return <SchedulesClientLayout>{children}</SchedulesClientLayout>;
}
