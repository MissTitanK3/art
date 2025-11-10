import type { ReactNode } from "react";
import { requireVerifiedProfileActive } from "@/lib/guards";

export default async function TrustManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireVerifiedProfileActive();
  return <>{children}</>;
}
