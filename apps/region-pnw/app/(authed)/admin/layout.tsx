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
  const isRegionAdmin = regionAdmins.includes(role);

  if (!isRegionAdmin) {
    // Secondary check via DAL: require profiles.access_role === 'dispatcher_admin'
    const profile = await getProfileByUserId(user!.id);
    if (!profile || profile.access_role !== 'dispatcher_admin') {
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
