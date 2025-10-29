import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { regionAdmins } from "@workspace/store/utils/nav";
import { getProfileByUserId } from "@/lib/dal/admin";
import AdminBackButton from "./_components/AdminBackButton";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Require authentication first; use server redirect capturing current path
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    const h = await headers();
    const nextUrl = h.get("next-url") ?? "/admin";
    redirect(`/sign-in?redirectTo=${encodeURIComponent(nextUrl)}`);
  }

  // Primary gate: session role includes region-level admins
  const role = ((user as any)?.user_metadata?.role ?? (user as any)?.role ?? "guest") as any;
  const allowed: string[] = ['dispatcher_admin', ...regionAdmins];
  if (!allowed.includes(role)) {
    // Fallback check via DAL in case session role is stale or missing
    const profile = await getProfileByUserId(user!.id);
    const profileRole = profile?.access_role as any;
    if (!profileRole || !allowed.includes(profileRole)) {
      redirect("/my-profile?reason=forbidden-admin");
    }
  }

  return (
    <>
      <AdminBackButton />
      {children}
    </>
  );
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
