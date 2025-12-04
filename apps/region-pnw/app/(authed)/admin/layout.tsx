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
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    const h = await headers();
    const nextUrl = h.get("next-url") ?? "/admin";
    redirect(`/sign-in?redirectTo=${encodeURIComponent(nextUrl)}`);
  }

  const meta = (user as unknown as { user_metadata?: Record<string, unknown> })
    .user_metadata;
  const metaRole = meta?.role;
  const fallbackRole = (user as unknown as { role?: unknown }).role;
  const role =
    typeof metaRole === "string"
      ? metaRole
      : typeof fallbackRole === "string"
        ? fallbackRole
        : "guest";
  const allowed: string[] = ["dispatcher_admin", ...regionAdmins];
  if (!allowed.includes(role)) {
    const profile = await getProfileByUserId(user!.id);
    const profileRole = profile?.access_role ?? null;
    if (
      !profileRole ||
      (typeof profileRole === "string" && !allowed.includes(profileRole))
    ) {
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
