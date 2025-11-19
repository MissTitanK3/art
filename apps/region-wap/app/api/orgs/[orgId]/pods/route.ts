import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  RouteError,
  createOrgPodSchema,
  ensureRole,
  ensureUniqueSlug,
  fetchOrgPods,
  handleRouteError,
  mapPodSummary,
  MANAGE_ROLES,
  resolveContext,
  sanitizeChannels,
  VIEW_ROLES,
} from './helpers';
import { slugify } from '@workspace/store/types/pod.ts';

export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const decoded = decodeURIComponent(orgId);
    const ctx = await resolveContext(decoded);
    ensureRole(ctx.orgRole, VIEW_ROLES);
    const pods = await fetchOrgPods(ctx.adminClient, decoded);
    return NextResponse.json({ pods });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const decoded = decodeURIComponent(orgId);
    const ctx = await resolveContext(decoded);
    ensureRole(ctx.orgRole, MANAGE_ROLES);
    const payload = createOrgPodSchema.parse(await req.json());

    const admin = ctx.adminClient;
    if ('existingPodId' in payload) {
      const { existingPodId } = payload;
      const { data: existing, error: podError } = await admin
        .from('pods')
        .select('id, name, slug, area')
        .eq('id', existingPodId)
        .maybeSingle();
      if (podError) throw new RouteError(podError.message, 500);
      if (!existing) throw new RouteError('POD_NOT_FOUND', 404);

      const { error: linkError } = await admin.from('organization_pods').upsert(
        {
          id: randomUUID(),
          org_id: decoded,
          pod_id: existingPodId,
        },
        { onConflict: 'org_id,pod_id' },
      );
      if (linkError) throw new RouteError(linkError.message, 500);

      return NextResponse.json({ pod: mapPodSummary(existing) });
    }

    const channels = sanitizeChannels(payload.channels);
    const name = payload.name.trim();
    const podId = randomUUID();
    const slug = await ensureUniqueSlug(admin, slugify(name));
    const area = payload.area?.trim() || null;

    const { error: createError } = await admin.from('pods').insert({
      id: podId,
      slug,
      name,
      area,
      channels,
      created_by: ctx.profileId,
    });
    if (createError) throw new RouteError(createError.message, 500);

    const { error: linkError } = await admin.from('organization_pods').insert({
      id: randomUUID(),
      org_id: decoded,
      pod_id: podId,
    });
    if (linkError) throw new RouteError(linkError.message, 500);

    return NextResponse.json({
      pod: {
        id: podId,
        name,
        slug,
        area,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
