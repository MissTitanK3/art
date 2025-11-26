import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getProfileByUserId } from '@/lib/dal/admin';
import { createSupabaseServerClient, createSupabaseRegionServiceClient } from '@/lib/auth/supabase/server';
import { regionAdmins } from '@workspace/store/utils/nav';
import { slugify } from '@workspace/store/types/pod.ts';

export const CHANNEL_TYPES = ['Signal', 'Matrix', 'LoRa'] as const;

export type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer';
export const VIEW_ROLES: OrgRole[] = ['owner', 'admin', 'editor', 'viewer'];
export const MANAGE_ROLES: OrgRole[] = ['owner', 'admin'];
export const EDIT_ROLES: OrgRole[] = ['owner', 'admin', 'editor'];

export type ChannelInput = {
  type: (typeof CHANNEL_TYPES)[number];
  link?: string | null;
};

export type OrgPodSummary = {
  id: string;
  name: string;
  slug?: string | null;
  area?: string | null;
};

export const channelSchema = z.object({
  type: z.enum(CHANNEL_TYPES),
  link: z
    .string()
    .url('Link must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const createOrgPodSchema = z.union([
  z.object({
    existingPodId: z.string().min(1),
  }),
  z.object({
    name: z.string().min(3).max(120),
    area: z.string().max(120).optional(),
    channels: z.array(channelSchema).max(4).optional(),
  }),
]);

export const updateOrgPodSchema = z
  .object({
    name: z.string().min(3).max(120).optional(),
    area: z.string().max(120).optional(),
    channels: z.array(channelSchema).max(4).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No fields to update',
  });

export class RouteError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof RouteError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('[orgs/pods] unexpected', error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export async function resolveContext(orgId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new RouteError('AUTH_REQUIRED', 401);
  }

  const profile = await getProfileByUserId(userData.user.id);
  if (!profile?.id) {
    throw new RouteError('PROFILE_REQUIRED', 403);
  }

  const { data: roleRow, error: roleError } = await supabase
    .from('organization_roles')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', profile.id)
    .is('deleted_at', null)
    .maybeSingle();
  if (roleError) throw new RouteError(roleError.message, 500);

  let orgRole = (roleRow?.role ?? null) as OrgRole | null;
  if (!orgRole) {
    const elevated = new Set<string>(['dispatcher_admin', ...regionAdmins]);
    if (profile.access_role && elevated.has(profile.access_role)) {
      orgRole = 'owner';
    }
  }
  if (!orgRole) {
    throw new RouteError('Forbidden', 403);
  }

  const adminClient = createSupabaseRegionServiceClient();
  return {
    supabase,
    adminClient,
    profileId: profile.id,
    orgRole,
  };
}

export function ensureRole(role: OrgRole | null, allowed: OrgRole[]) {
  if (!role || !allowed.includes(role)) {
    throw new RouteError('Forbidden', 403);
  }
}

export function mapPodSummary(row: any): OrgPodSummary {
  const pod = row?.pod ?? row ?? {};
  return {
    id: String(pod.id),
    name: String(pod.name ?? 'Pod'),
    slug: pod.slug ?? null,
    area: pod.area ?? null,
  };
}

export async function fetchOrgPods(admin: SupabaseClient, orgId: string) {
  const { data, error } = await admin
    .from('organization_pods')
    .select('pod_id, pod:pods(id, name, slug, area)')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .is('pod.deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw new RouteError(error.message, 500);
  const rows = Array.isArray(data) ? data : [];
  return rows.map(mapPodSummary);
}

export async function ensureUniqueSlug(admin: SupabaseClient, base: string) {
  let attempt = base;
  for (let i = 0; i < 5; i++) {
    const { data } = await admin.from('pods').select('id').eq('slug', attempt).maybeSingle();
    if (!data) return attempt;
    attempt = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${randomUUID().slice(0, 4)}`;
}

export function sanitizeChannels(channels?: ChannelInput[]) {
  if (!Array.isArray(channels)) return [];
  return channels.map((channel) => ({
    type: channel.type,
    link: channel.link?.trim() || null,
  }));
}
