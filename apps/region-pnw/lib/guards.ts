import 'server-only';

import { redirect } from 'next/navigation';
import { requireServerSession } from '@/lib/auth/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import { completeOnboarding, elevatedRoles, localAdmins, NavRole } from '@workspace/store/utils/nav';

function isSuspended(state?: string | null) {
  return state === 'suspended';
}

function isVerified(verified_by?: string | null) {
  // Consider anything other than 'self' as verified by a third party/admin
  return verified_by && verified_by !== 'self';
}

function hasDispatchPrivileges(role: NavRole, profileAccessRole?: string | null) {
  // Allow if session role is elevated OR profile access role is dispatcher_verified/admin
  if (elevatedRoles.includes(role)) return true;
  return profileAccessRole === 'dispatcher_verified' || profileAccessRole === 'dispatcher_admin';
}

export async function requireVerifiedProfileActive() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  if (!isVerified(profile.verified_by)) {
    redirect('/my-profile?reason=awaiting_verification');
  }

  return { session, profile };
}

export async function requireDispatchAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  if (!hasDispatchPrivileges(session.user.role, profile.access_role)) {
    redirect('/my-profile?reason=forbidden-dispatch');
  }

  return { session, profile };
}

export async function requireLocalAdminAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  const isLocalAdmin = localAdmins.includes(session.user.role);
  const isDispatchAdmin = profile.access_role === 'dispatcher_admin';
  if (!isLocalAdmin && !isDispatchAdmin) {
    redirect('/my-profile?reason=forbidden-schedules');
  }

  return { session, profile };
}

export async function requireElevatedAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  const isElevated = elevatedRoles.includes(session.user.role);
  if (!isElevated) {
    redirect('/my-profile?reason=forbidden-elevated');
  }

  return { session, profile };
}

export async function requireOnboardedAccess() {
  const session = await requireServerSession();
  const profile = await getProfileByUserId(session.user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  const ok = completeOnboarding.includes(session.user.role);
  if (!ok) {
    // If authenticated but not fully onboarded, send to profile instead of sign-in
    redirect('/my-profile?reason=onboarding');
  }

  return { session, profile };
}
