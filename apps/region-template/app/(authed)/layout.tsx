import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireServerSession } from "@/lib/auth/server";

type AuthedLayoutProps = {
  children: ReactNode;
};

export default async function AuthedLayout({ children }: AuthedLayoutProps) {
  try {
    await requireServerSession();
  } catch (error) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      redirect("/sign-in");
    }
    throw error;
  }

  return <>{children}</>;
}
