import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

type AuthedLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AuthedLayout({ children }: AuthedLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    const h = await headers();
    const nextUrl = h.get("next-url") ?? "/";
    redirect(`/sign-in?redirectTo=${encodeURIComponent(nextUrl)}`);
  }
  return <>{children}</>;
}
