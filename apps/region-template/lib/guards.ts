import "server-only";

import { redirect } from "next/navigation";
import { requireServerSession } from "@/lib/auth/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import {
  completeOnboarding,
  elevatedRoles,
  localAdmins,
  NavRole,
} from "@workspace/store/utils/nav";
import {
  isSuspended,
  isVerified,
  hasRole,
} from "@workspace/store/utils/access";

// Access control is driven by public.profiles.access_role
// AccessRole is unified with NavRole across the app

// hasDispatchPrivileges previously allowed either elevated session roles or
// profile-level dispatcher roles. We can express the same using shared helpers
// and the elevatedRoles/localAdmins arrays. Keep the logic explicit here so
// callers are clear about the intent.
function hasDispatchPrivileges(
  role: NavRole,
  profileAccessRole?: string | null,
) {
  if (hasRole(role, elevatedRoles)) return true;
  return (
    profileAccessRole === "dispatcher_verified" ||
    profileAccessRole === "dispatcher_admin"
  );
}

export async function requireVerifiedProfileActive() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/my-profile?reason=profile-required");
  }

  if (isSuspended(profile.state)) {
    redirect("/my-profile?reason=suspended");
  }

  if (!isVerified(profile.verified_by)) {
    redirect("/my-profile?reason=awaiting_verification");
  }

  return { session, profile };
}

export async function requireDispatchAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/my-profile?reason=profile-required");
  }

  if (isSuspended(profile.state)) {
    redirect("/my-profile?reason=suspended");
  }

  if (!hasDispatchPrivileges(session.user.role, profile.access_role)) {
    redirect("/my-profile?reason=forbidden-dispatch");
  }

  return { session, profile };
}

export async function requireLocalAdminAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/my-profile?reason=profile-required");
  }

  if (isSuspended(profile.state)) {
    redirect("/my-profile?reason=suspended");
  }

  const isLocalAdmin = localAdmins.includes(session.user.role);
  const isDispatchAdmin = profile.access_role === "dispatcher_admin";
  if (!isLocalAdmin && !isDispatchAdmin) {
    redirect("/my-profile?reason=forbidden-schedules");
  }

  return { session, profile };
}

export async function requireElevatedAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/my-profile?reason=profile-required");
  }

  if (isSuspended(profile.state)) {
    redirect("/my-profile?reason=suspended");
  }

  const isElevated = elevatedRoles.includes(session.user.role);
  if (!isElevated) {
    redirect("/my-profile?reason=forbidden-elevated");
  }

  return { session, profile };
}

export async function requireOnboardedAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect("/my-profile?reason=profile-required");
  }

  if (isSuspended(profile.state)) {
    redirect("/my-profile?reason=suspended");
  }

  const ok = completeOnboarding.includes(session.user.role);
  if (!ok) {
    redirect("/sign-in");
  }

  return { session, profile };
}
