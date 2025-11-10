import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredSignals } from "@/lib/syncSignals";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const [, token] = auth.split(" ");
  return token && token === process.env.INTERNAL_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { daysPastExpiry = 14 } = (await req.json().catch(() => ({}))) as {
      daysPastExpiry?: number;
    };
    await cleanupExpiredSignals(daysPastExpiry);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Cleanup failed" },
      { status: 500 },
    );
  }
}
