import { NextResponse } from 'next/server';
import {
  RouteError,
  createOrgPodSchema,
  ensureRole,
  fetchOrgPods,
  handleRouteError,
  linkExistingPod,
  createPodForOrg,
  MANAGE_ROLES,
  resolveContext,
  sanitizeChannels,
  VIEW_ROLES,
} from './helpers';

export async function GET(_req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const decoded = decodeURIComponent(orgId);
    const ctx = await resolveContext(decoded);
    ensureRole(ctx.orgRole, VIEW_ROLES);
    const pods = await fetchOrgPods(decoded);
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

    if ('existingPodId' in payload) {
      const { existingPodId } = payload;
      const pod = await linkExistingPod(decoded, existingPodId);
      return NextResponse.json({ pod });
    }

    const channels = sanitizeChannels(payload.channels);
    const name = payload.name.trim();
    const area = payload.area?.trim() || null;
    const pod = await createPodForOrg({
      orgId: decoded,
      name,
      area,
      channels,
      createdBy: ctx.profileId,
    });

    return NextResponse.json({ pod });
  } catch (error) {
    return handleRouteError(error);
  }
}
