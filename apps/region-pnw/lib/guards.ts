import 'server-only';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import {
  type NavRole,
  completeOnboarding,
  elevatedRoles,
  localAdmins,
  regionAdmins,
  nationalAdmins,
} from '@workspace/store/utils/nav';

// Access control is driven by public.profiles.access_role
// AccessRole is unified with NavRole across the app

function isSuspended(state?: string | null) {
  return state === 'suspended';
}

function isVerified(verified_by?: string | null) {
  // Consider anything other than 'self' as verified by a third party/admin
  return verified_by && verified_by !== 'self';
}

function hasRole(role: NavRole | undefined, allowed: NavRole[]) {
  if (!role) return false;
  return allowed.includes(role);
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

  // Align with nav: Dispatch protected routes require elevated roles
  const role = profile.access_role as NavRole | undefined;
  if (!hasRole(role, elevatedRoles)) {
    redirect('/my-profile?reason=forbidden-dispatch');
  }

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}

// Entry points like /team-req follow elevatedRoles in nav config
export async function requireDispatchBasicAccess() {
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

  const role = profile.access_role as NavRole | undefined;
  if (!hasRole(role, elevatedRoles)) {
    redirect('/my-profile?reason=forbidden-dispatch-basic');
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

  // Align with nav: local admin features (e.g., schedules) follow localAdmins
  const role = profile.access_role as NavRole | undefined;
  if (!hasRole(role, localAdmins)) {
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

  const role = profile.access_role as NavRole | undefined;
  if (!hasRole(role, elevatedRoles)) {
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

  // Align with nav: completeOnboarding set gates access to core features
  const role = profile.access_role as NavRole | undefined;
  if (!hasRole(role, completeOnboarding)) redirect('/my-profile?reason=onboarding');

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}
