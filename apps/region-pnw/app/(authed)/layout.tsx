import type { ReactNode } from "react";
import { getServerSession } from "@/lib/auth/server";
import RedirectToSignIn from "@/components/client/RedirectToSignIn";

type AuthedLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AuthedLayout({ children }: AuthedLayoutProps) {
  const session = await getServerSession();
  if (!session) {
    // Use a client-side redirect so we can capture the exact current path
    return <RedirectToSignIn />;
  }
  return <>{children}</>;
}
