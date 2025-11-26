import 'server-only';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { getProfileByUserId } from '@/lib/dal/admin';
import {
  type NavRole,
  completeOnboarding,
} from '@workspace/store/utils/nav';

import { isSuspended, isVerified } from '@workspace/store/utils/access';
import { evaluateAccess } from '@workspace/store/utils/permissions/unifiedEngine';
import { VisibilityScope } from '@workspace/store/utils/permissions/types';
import { hydratePermissionsContext } from '@workspace/store/utils/permissions/hydrateContext';

// Access control is driven by public.profiles.access_role
// AccessRole is unified with NavRole across the app

async function verifyAccessOrRedirect(scope: VisibilityScope, failureReason: string) {
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

  // Use centralized permissions context hydration
  const permissionsContext = await hydratePermissionsContext(
    supabase,
    user.id,
    profile.id
  );

  const result = evaluateAccess(scope, {
    ...permissionsContext,
    navRole: role,
  });

  if (!result.access) {
    redirect(`/my-profile?reason=${failureReason}`);
  }

  const session = { user: { id: user.id } } as any;
  return { session, profile };
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
  return verifyAccessOrRedirect('dispatch_dashboard', 'forbidden-dispatch');
}

// Entry points like /team-req follow elevatedRoles in nav config
export async function requireDispatchBasicAccess() {
  return verifyAccessOrRedirect('dispatch_dashboard', 'forbidden-dispatch-basic');
}

export async function requireLocalAdminAccess() {
  return verifyAccessOrRedirect('schedules_manage', 'forbidden-schedules');
}

export async function requireVerifiedAdminAccess() {
  return verifyAccessOrRedirect('verified_ops', 'forbidden-elevated');
}

export async function requireElevatedAccess() {
  return verifyAccessOrRedirect('elevated_ops', 'forbidden-elevated');
}

export async function requireOnboardedAccess() {
  // Special case: redirect to onboarding if failed, not just forbidden
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
  const result = evaluateAccess('core_features', {
    userId: user.id,
    navRole: role,
  });

  if (!result.access) {
    redirect('/my-profile?reason=onboarding');
  }

  const session = { user: { id: user.id } } as any;
  return { session, profile };
}
