import type { ReactNode } from "react";
import { requireVerifiedProfileActive } from "@/lib/guards";
import PodsClientLayout from "./providers.client";

export default async function PodsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireVerifiedProfileActive();
  return <PodsClientLayout>{children}</PodsClientLayout>;
}
