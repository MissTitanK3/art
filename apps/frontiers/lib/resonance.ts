import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

type DonationArgs = {
  source_email: string;
  amount: number;
  message_id: string;
  created_at?: string;
  donor_alias?: string | null;
  message?: string | null;
};

function isUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

async function scheduleNotifications(profileIds: string[], payload: any) {
  if (!profileIds.length) return;
  const rows = profileIds.map((pid) => ({
    profile_id: pid,
    type: "resonance",
    payload,
  }));
  await supabase.from("notifications").insert(rows);
}

export async function triggerResonance(args: DonationArgs) {
  const createdAt = args.created_at || new Date().toISOString();

  // 1) Record donation in public ledger (idempotent on message_id)
  await supabase.from("donations").upsert(
    {
      profile_email: args.source_email,
      amount: args.amount,
      message_id: args.message_id,
      donor_alias: args.donor_alias ?? null,
      message: args.message ?? null,
      created_at: createdAt,
    },
    { onConflict: "message_id" },
  );

  // 2) Trigger resonance propagation starting from donor identity
  const donorKey = args.source_email || "anonymous";
  if (!isUUID(donorKey)) return { ok: true, skipped: "non-uuid-donor" };
  const baseStrength = Number.isFinite(args.amount) ? args.amount : 1;

  const MAX_HOP = 3;
  const CAP = 50;
  const EXPIRES = new Date(Date.now() + 86_400_000).toISOString();

  let hop = 0;
  let currentIds: string[] = [donorKey];
  let visited = new Set<string>(currentIds);
  let inserted = 0;

  while (hop < MAX_HOP && inserted < CAP && currentIds.length > 0) {
    // Consider connections as undirected for propagation
    const { data: rows1 } = await supabase
      .from("connections")
      .select("source_id,target_id")
      .in("source_id", currentIds);
    const { data: rows2 } = await supabase
      .from("connections")
      .select("source_id,target_id")
      .in("target_id", currentIds);

    const neighborSet = new Set<string>();
    const currentSet = new Set(currentIds);
    for (const r of [...(rows1 || []), ...(rows2 || [])]) {
      if (currentSet.has(r.source_id)) neighborSet.add(r.target_id);
      if (currentSet.has(r.target_id)) neighborSet.add(r.source_id);
    }

    let nextRecipients = Array.from(neighborSet).filter(
      (id) => !visited.has(id),
    );
    if (nextRecipients.length === 0) break;

    const nextHop = hop + 1;
    const base = baseStrength * Math.pow(0.75, nextHop);
    const remaining = CAP - inserted;
    const slice = nextRecipients.slice(0, remaining);

    // Apply trust weights from connections
    const uuidCurrent = currentIds.filter(isUUID);
    const uuidSlice = slice.filter(isUUID);
    let weightMap: Record<string, number> = {};
    if (uuidCurrent.length && uuidSlice.length) {
      const { data: t1 } = await supabase
        .from("connections")
        .select("source_id,target_id,trust")
        .in("source_id", uuidCurrent)
        .in("target_id", uuidSlice);
      const { data: t2 } = await supabase
        .from("connections")
        .select("source_id,target_id,trust")
        .in("source_id", uuidSlice)
        .in("target_id", uuidCurrent);
      for (const r of [...(t1 || []), ...(t2 || [])]) {
        const to = (r as any).target_id as string;
        const w = Math.max(0, Math.min(1, Number((r as any).trust || 0)));
        weightMap[to] = Math.max(weightMap[to] || 0, w);
      }
    }
    const batch = slice.map((rid) => ({
      source_id: donorKey,
      source_email: args.source_email,
      recipient_id: rid,
      hop: nextHop,
      strength: base * (weightMap[rid] ?? 1),
      amount: args.amount,
      donation_message_id: args.message_id,
      region_id: null,
      expires_at: EXPIRES,
    }));

    if (batch.length > 0) {
      const { error: insErr } = await supabase
        .from("resonance_effects")
        .insert(batch);
      if (insErr) break;
      inserted += batch.length;
      // Schedule in-app notifications for this hop
      await scheduleNotifications(slice, {
        kind: "resonance",
        hop: nextHop,
        strength: base,
        amount: args.amount,
        source_email: args.source_email,
        message_id: args.message_id,
        expires_at: EXPIRES,
      });
    }

    slice.forEach((id) => visited.add(id));
    currentIds = slice;
    hop = nextHop;
  }

  return { ok: true };
}
