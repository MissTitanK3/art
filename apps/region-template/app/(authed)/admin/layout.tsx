import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireServerSession } from "@/lib/auth/server";
import { regionAdmins } from "@workspace/store/utils/nav";
import { getProfileByUserId } from "@/lib/dal/admin";
import AdminBackButton from "./_components/AdminBackButton";
import AdminClientLayout from "./providers.client";

type AdminLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Require authentication first
  const session = await requireServerSession();

  // Primary gate: session role includes region-level admins
  const role = session.user.role as any;
  const allowed: string[] = ['dispatcher_admin', ...regionAdmins];
  if (!allowed.includes(role)) {
    // Fallback check via DAL: trust profile.access_role when session role is not in allowlist
    const profile = await getProfileByUserId(session.user.id);
    const profileRole = profile?.access_role as any;
    if (!profileRole || !allowed.includes(profileRole)) {
      redirect("/my-profile?reason=forbidden-admin");
    }
  }

  return (
    <AdminClientLayout>
      <AdminBackButton />
      {children}
    </AdminClientLayout>
  );
}
