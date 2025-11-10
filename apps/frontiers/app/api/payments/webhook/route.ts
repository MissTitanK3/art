import { NextResponse } from "next/server";
import {
  verifyKofiSignature,
  normalizeDonation,
  type KofiPayload,
} from "@/lib/payments";
import { triggerResonance } from "@/lib/resonance";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as KofiPayload;
  const signature = req.headers.get("x-ko-fi-signature");

  const verified = verifyKofiSignature(body, signature);
  if (!verified) return NextResponse.json({ ok: false }, { status: 401 });

  if (body.type === "Donation") {
    const info = normalizeDonation(body);
    await triggerResonance({
      source_email: info.profile_email,
      amount: info.amount,
      message_id: info.message_id,
      donor_alias: info.donor_alias,
      message: info.message,
      created_at: info.created_at,
    });
  }

  return NextResponse.json({ ok: true });
}
