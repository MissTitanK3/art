import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  EDIT_ROLES,
  MANAGE_ROLES,
  RouteError,
  ensureRole,
  ensureUniqueSlug,
  handleRouteError,
  mapPodSummary,
  resolveContext,
  sanitizeChannels,
  updateOrgPodSchema,
} from '../helpers';
import { slugify } from '@workspace/store/types/pod.ts';

async function assertOrgOwnsPod(admin: SupabaseClient<any, 'public', any>, orgId: string, podId: string) {
  const { data, error } = await admin
    .from('organization_pods')
    .select('id')
    .eq('org_id', orgId)
    .eq('pod_id', podId)
    .maybeSingle();
  if (error) throw new RouteError(error.message, 500);
  if (!data) throw new RouteError('NOT_FOUND', 404);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ orgId: string; podId: string }> }) {
  try {
    const { orgId, podId } = await params;
    const decodedOrgId = decodeURIComponent(orgId);
    const decodedPodId = decodeURIComponent(podId);
    const ctx = await resolveContext(decodedOrgId);
    ensureRole(ctx.orgRole, EDIT_ROLES);
    await assertOrgOwnsPod(ctx.adminClient, decodedOrgId, decodedPodId);

    const payload = updateOrgPodSchema.parse(await req.json());
    const patch: Record<string, unknown> = {};
    if (payload.name) {
      const trimmed = payload.name.trim();
      patch.name = trimmed;
      patch.slug = await ensureUniqueSlug(ctx.adminClient, slugify(trimmed));
    }
    if (payload.area !== undefined) {
      patch.area = payload.area?.trim() || null;
    }
    if (payload.channels) {
      patch.channels = sanitizeChannels(payload.channels);
    }

    if (Object.keys(patch).length === 0) {
      throw new RouteError('No changes provided', 400);
    }

    const { data, error } = await ctx.adminClient
      .from('pods')
      .update(patch)
      .eq('id', decodedPodId)
      .select('id, name, slug, area')
      .maybeSingle();
    if (error) throw new RouteError(error.message, 500);
    if (!data) throw new RouteError('POD_NOT_FOUND', 404);
    return NextResponse.json({ pod: mapPodSummary(data) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ orgId: string; podId: string }> }) {
  try {
    const { orgId, podId } = await params;
    const decodedOrgId = decodeURIComponent(orgId);
    const decodedPodId = decodeURIComponent(podId);
    const ctx = await resolveContext(decodedOrgId);
    ensureRole(ctx.orgRole, MANAGE_ROLES);
    await assertOrgOwnsPod(ctx.adminClient, decodedOrgId, decodedPodId);

    const url = new URL(req.url);
    const hardDelete = url.searchParams.get('hard') === 'true';

    const { error: unlinkError } = await ctx.adminClient
      .from('organization_pods')
      .delete()
      .eq('org_id', decodedOrgId)
      .eq('pod_id', decodedPodId);
    if (unlinkError) throw new RouteError(unlinkError.message, 500);

    let podDeleted = false;
    if (hardDelete) {
      const { data: remaining, error: remainingError } = await ctx.adminClient
        .from('organization_pods')
        .select('id')
        .eq('pod_id', decodedPodId)
        .limit(1);
      if (remainingError) throw new RouteError(remainingError.message, 500);
      if (!remaining || remaining.length === 0) {
        const { error: deleteError } = await ctx.adminClient.rpc('safe_delete_pod', { p_id: decodedPodId });
        if (deleteError) throw new RouteError(deleteError.message, 500);
        podDeleted = true;
      }
    }

    return NextResponse.json({ removed: true, podDeleted });
  } catch (error) {
    return handleRouteError(error);
  }
}
