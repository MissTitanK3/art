import { NextResponse } from 'next/server';
import {
  EDIT_ROLES,
  MANAGE_ROLES,
  RouteError,
  ensureRole,
  ensureUniqueSlug,
  handleRouteError,
  resolveContext,
  sanitizeChannels,
  updateOrgPodSchema,
  ensureOrgOwnsPod,
  updatePodRecord,
  unlinkPodFromOrg,
  deletePodIfOrphan,
} from '../helpers';
import { slugify } from '@workspace/store/types/pod.ts';

export async function PATCH(req: Request, { params }: { params: Promise<{ orgId: string; podId: string }> }) {
  try {
    const { orgId, podId } = await params;
    const decodedOrgId = decodeURIComponent(orgId);
    const decodedPodId = decodeURIComponent(podId);
    const ctx = await resolveContext(decodedOrgId);
    ensureRole(ctx.orgRole, EDIT_ROLES);
    await ensureOrgOwnsPod(decodedOrgId, decodedPodId);

    const payload = updateOrgPodSchema.parse(await req.json());
    const patch: Record<string, unknown> = {};
    if (payload.name) {
      const trimmed = payload.name.trim();
      patch.name = trimmed;
      patch.slug = await ensureUniqueSlug(slugify(trimmed));
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

    const pod = await updatePodRecord(decodedPodId, patch);
    return NextResponse.json({ pod });
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
    await ensureOrgOwnsPod(decodedOrgId, decodedPodId);

    const url = new URL(req.url);
    const hardDelete = url.searchParams.get('hard') === 'true';

    const removed = await unlinkPodFromOrg(decodedOrgId, decodedPodId);
    if (!removed) {
      throw new RouteError('NOT_FOUND', 404);
    }

    let podDeleted = false;
    if (hardDelete) {
      podDeleted = await deletePodIfOrphan(decodedPodId);
    }

    return NextResponse.json({ removed: true, podDeleted });
  } catch (error) {
    return handleRouteError(error);
  }
}
