import { NextResponse } from "next/server";
import { getAuthProviderId } from "@/lib/auth/adapter";
import { getServerSession } from "@/lib/auth/server";
import { getProfileByUserId } from "@/lib/dal/admin";
import { regionAdmins } from "@workspace/store/utils/nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const provider = getAuthProviderId();
    const session = await getServerSession();
    const userId = session?.user?.id ?? null;
    const role = session?.user?.role ?? null;

    let profile: any = null;
    if (userId) {
      try {
        const p = await getProfileByUserId(userId);
        if (p) {
          // redact potentially large fields
          const { id, user_id, access_role, verified_by, state, inserted_at } = p as any;
          profile = { id, user_id, access_role, verified_by, state, inserted_at };
        }
      } catch (e) {
        profile = { error: String(e) };
      }
    }

    return NextResponse.json({
      ok: true,
      provider,
      session: session ? { user: { id: userId, role }, provider: session.provider } : null,
      roleIsRegionAdmin: role ? regionAdmins.includes(role as any) : false,
      profile,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
