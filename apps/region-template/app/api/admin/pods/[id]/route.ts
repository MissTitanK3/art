import { NextResponse } from "next/server";
import { requireServerSession } from "@/lib/auth/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import { regionAdmins } from "@workspace/store/utils/nav";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { slugify } from "@workspace/store/types/pod.ts";

function isDemoProvider() {
  const p =
    process.env.NEXT_PUBLIC_AUTH_PROVIDER ??
    process.env.AUTH_PROVIDER ??
    "demo";
  return p === "demo";
}

async function authz() {
  const session = await requireServerSession();
  const callerRole = session.user.role;
  let authorized = regionAdmins.includes(callerRole);
  if (!authorized) {
    const callerProfile = await getProfileByUserId(session.user.id);
    authorized =
      !!callerProfile && callerProfile.access_role === "dispatcher_admin";
  }
  return authorized;
}

function clientFromCookies() {
  const env = ensureSupabaseEnv("server");
  return nextCookies()
    .then((store) =>
      createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            if (!store) return [] as { name: string; value: string }[];
            return store
              .getAll()
              .map(({ name, value }: { name: string; value: string }) => ({
                name,
                value,
              }));
          },
          setAll(cookies) {
            if (!store) return;
            try {
              cookies.forEach(({ name, value, options }) => {
                store.set(name, value, options as CookieOptions | undefined);
              });
            } catch {
              /* no-op */
            }
          },
        },
      }),
    )
    .catch(() => {
      const store: any = null;
      return createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            if (!store) return [] as { name: string; value: string }[];
            return [];
          },
          setAll() {},
        },
      });
    });
}

type PatchBody = Partial<{
  name: string;
  area: string;
  channels: any[];
}>;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await authz()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = (await req.json()) as PatchBody;
    const patch: any = {};
    if (typeof body.name === "string" && body.name.trim()) {
      patch.name = body.name.trim();
      patch.slug = slugify(patch.name);
    }
    if (typeof body.area === "string") patch.area = body.area;
    if (Array.isArray(body.channels)) patch.channels = body.channels;
    if (Object.keys(patch).length === 0)
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });

    if (isDemoProvider())
      return NextResponse.json({ pod: { id, ...patch }, demo: true });

    const client = await clientFromCookies();
    const { data, error } = await client
      .from("pods")
      .update(patch)
      .eq("id", id)
      .select("id, slug, name, area, channels")
      .limit(1);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const row = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({ pod: row ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await authz()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    if (isDemoProvider()) return NextResponse.json({ ok: true, demo: true });
    const client = await clientFromCookies();
    const { error } = await client.from("pods").delete().eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}
