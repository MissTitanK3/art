import 'server-only';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';

// Access control is now driven by public.profiles.access_role
//   access_role ∈ { 'team_member', 'dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin' }
type AccessRole = 'team_member' | 'dispatcher_basic' | 'dispatcher_verified' | 'dispatcher_admin';

function isSuspended(state?: string | null) {
  return state === 'suspended';
}

function isVerified(verified_by?: string | null) {
  // Consider anything other than 'self' as verified by a third party/admin
  return verified_by && verified_by !== 'self';
}

// Dispatcher role gates derived from profiles.access_role
function isDispatchBasic(accessRole?: string | null) {
  return accessRole === 'dispatcher_basic' || accessRole === 'dispatcher_verified' || accessRole === 'dispatcher_admin';
}

function isDispatchVerified(accessRole?: string | null) {
  return accessRole === 'dispatcher_verified' || accessRole === 'dispatcher_admin';
}

function isDispatchAdmin(accessRole?: string | null) {
  return accessRole === 'dispatcher_admin';
}

export async function requireVerifiedProfileActive() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/sign-in');
  const user = userData!.user as any;
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  if (!isVerified(profile.verified_by)) {
    redirect('/my-profile?reason=awaiting_verification');
  }

  // Session is returned for downstream usage; we no longer rely on session.user.role for gates
  const session = { user: { id: user.id } } as any;
  return { session, profile };
}

export async function requireDispatchAccess() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/sign-in');
  const user = userData!.user as any;
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  // Require at least verified dispatcher to access protected dispatch features
  if (!isDispatchVerified(profile.access_role)) {
    redirect('/my-profile?reason=forbidden-dispatch');
  }

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}

export async function requireLocalAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/sign-in');
  const user = userData!.user as any;
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  // Limit to dispatcher admins for local admin features
  const isDispatchAdminRole = isDispatchAdmin(profile.access_role);
  if (!isDispatchAdminRole) {
    redirect('/my-profile?reason=forbidden-schedules');
  }

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}

export async function requireElevatedAccess() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/sign-in');
  const user = userData!.user as any;
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  // Map "elevated" to dispatcher verified and above
  const isElevated = isDispatchVerified(profile.access_role);
  if (!isElevated) {
    redirect('/my-profile?reason=forbidden-elevated');
  }

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}

export async function requireOnboardedAccess() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/sign-in');
  const user = userData!.user as any;
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect('/my-profile?reason=profile-required');
  }

  if (isSuspended(profile.state)) {
    redirect('/my-profile?reason=suspended');
  }

  // Consider any valid profile.access_role as onboarded to use core features
  const onboarded = Boolean((profile.access_role as AccessRole | null) ?? 'team_member');
  if (!onboarded) redirect('/my-profile?reason=onboarding');

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}
