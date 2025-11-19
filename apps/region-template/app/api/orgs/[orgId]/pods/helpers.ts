import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
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

type StoredPod = OrgPodSummary & {
  slug: string | null;
  channels: ChannelInput[];
  createdBy: string;
  createdAt: number;
};

const TEMPLATE_PROFILE_ID = 'template-profile';
const DEFAULT_ROLE: OrgRole = 'owner';
const TEMPLATE_ORG_ID = 'demo-org';

const podTable = new Map<string, StoredPod>();
const orgPodIndex = new Map<string, string[]>();

seedDemoData();

function seedDemoData() {
  if (podTable.size > 0) return;

  const demoPods: StoredPod[] = [
    {
      id: 'pod-demo-harbor',
      name: 'Harbor Ops',
      slug: 'harbor-ops',
      area: 'Astoria',
      channels: [
        { type: 'Signal', link: 'https://signal.group/#harbor' },
        { type: 'Matrix', link: 'https://matrix.to/#/#harbor:demo' },
      ],
      createdBy: TEMPLATE_PROFILE_ID,
      createdAt: Date.now(),
    },
    {
      id: 'pod-demo-ham',
      name: 'Ham Mesh',
      slug: 'ham-mesh',
      area: 'Tillamook County',
      channels: [{ type: 'LoRa', link: null }],
      createdBy: TEMPLATE_PROFILE_ID,
      createdAt: Date.now() + 1,
    },
  ];

  demoPods.forEach((pod) => podTable.set(pod.id, pod));
  orgPodIndex.set(
    TEMPLATE_ORG_ID,
    demoPods.map((pod) => pod.id),
  );
}

function ensureOrgIndex(orgId: string) {
  if (!orgPodIndex.has(orgId)) {
    const templateLinks = orgPodIndex.get(TEMPLATE_ORG_ID) ?? [];
    orgPodIndex.set(orgId, Array.from(templateLinks));
  }
  return orgPodIndex.get(orgId)!;
}

export async function resolveContext(orgId: string) {
  ensureOrgIndex(orgId);
  return {
    profileId: TEMPLATE_PROFILE_ID,
    orgRole: DEFAULT_ROLE,
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

export async function fetchOrgPods(orgId: string) {
  const links = ensureOrgIndex(orgId);
  return links
    .map((podId) => podTable.get(podId))
    .filter((pod): pod is StoredPod => Boolean(pod))
    .map(mapPodSummary);
}

export async function linkExistingPod(orgId: string, podId: string) {
  const pod = podTable.get(podId);
  if (!pod) {
    throw new RouteError('POD_NOT_FOUND', 404);
  }
  const links = ensureOrgIndex(orgId);
  if (!links.includes(podId)) {
    links.push(podId);
  }
  return mapPodSummary(pod);
}

export async function createPodForOrg({
  orgId,
  name,
  area,
  channels,
  createdBy,
}: {
  orgId: string;
  name: string;
  area: string | null;
  channels: ChannelInput[];
  createdBy: string;
}) {
  const podId = randomUUID();
  const slug = await ensureUniqueSlug(slugify(name));
  const record: StoredPod = {
    id: podId,
    name,
    slug,
    area,
    channels,
    createdBy,
    createdAt: Date.now(),
  };
  podTable.set(podId, record);
  const links = ensureOrgIndex(orgId);
  links.push(podId);
  return mapPodSummary(record);
}

export async function ensureOrgOwnsPod(orgId: string, podId: string) {
  const links = ensureOrgIndex(orgId);
  if (!links.includes(podId)) {
    throw new RouteError('NOT_FOUND', 404);
  }
}

export async function updatePodRecord(
  podId: string,
  patch: Partial<Pick<StoredPod, 'name' | 'slug' | 'area' | 'channels'>>,
) {
  const existing = podTable.get(podId);
  if (!existing) {
    throw new RouteError('POD_NOT_FOUND', 404);
  }
  const updated = { ...existing, ...patch } satisfies StoredPod;
  podTable.set(podId, updated);
  return mapPodSummary(updated);
}

export async function unlinkPodFromOrg(orgId: string, podId: string) {
  const links = ensureOrgIndex(orgId);
  const idx = links.indexOf(podId);
  if (idx === -1) {
    return false;
  }
  links.splice(idx, 1);
  return true;
}

export async function deletePodIfOrphan(podId: string) {
  const stillLinked = Array.from(orgPodIndex.values()).some((links) => links.includes(podId));
  if (stillLinked) {
    return false;
  }
  podTable.delete(podId);
  return true;
}

export async function ensureUniqueSlug(base: string) {
  let attempt = base;
  for (let i = 0; i < 5; i++) {
    const collision = Array.from(podTable.values()).some((pod) => pod.slug === attempt);
    if (!collision) return attempt;
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
