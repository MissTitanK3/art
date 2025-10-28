import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/lib/auth/server";
import RedirectToSignIn from "@/components/client/RedirectToSignIn";
import { regionAdmins } from "@workspace/store/utils/nav";
import { getProfileByUserId } from "@/lib/dal/admin";
import AdminBackButton from "./_components/AdminBackButton";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Require authentication first; prefer non-throwing check to avoid error logs
  const session = await getServerSession();
  if (!session) {
    return <RedirectToSignIn />;
  }

  // Primary gate: session role includes region-level admins
  const role = session.user.role;
  const isRegionAdmin = regionAdmins.includes(role);

  if (!isRegionAdmin) {
    // Secondary check via DAL: require profiles.access_role === 'dispatcher_admin'
    const profile = await getProfileByUserId(session.user.id);
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
