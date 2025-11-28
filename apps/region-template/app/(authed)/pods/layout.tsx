import type { ReactNode } from "react";
import { requireOnboardedAccess } from "@/lib/guards";
import PodsClientLayout from "./providers.client";

export default async function PodsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Allow any onboarded member (including team_member) to access pods
  await requireOnboardedAccess();
  return <PodsClientLayout>{children}</PodsClientLayout>;
}
