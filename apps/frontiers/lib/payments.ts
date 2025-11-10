import crypto from "crypto";

export type KofiPayload = {
  type: string;
  message_id: string;
  amount: string;
  from_name?: string;
  email?: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
};

export function verifyKofiSignature(
  body: unknown,
  signature: string | null | undefined,
) {
  if (!signature) return false;
  const secret = process.env.KOFI_SECRET_TOKEN || "";
  if (!secret) return false;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");
  return computed === signature;
}

export function normalizeDonation(p: KofiPayload) {
  return {
    profile_email: p.email || "",
    amount: parseFloat(p.amount || "0"),
    message_id: p.message_id,
    donor_alias: p.from_name || null,
    message: p.message || null,
    created_at: p.timestamp || new Date().toISOString(),
  };
}
