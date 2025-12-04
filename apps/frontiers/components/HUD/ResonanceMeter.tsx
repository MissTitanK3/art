"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type FeedItem = {
  id: string;
  when: string;
  text: string;
};

function fmtRelative(ts: string) {
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `+${mins} min`;
  const hours = Math.floor(mins / 60);
  return `+${hours} h`;
}

function fmtCountdown(ts?: string | null) {
  if (!ts) return "—";
  const diff = new Date(ts).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function ResonanceMeter() {
  const profileId = useProfileStore((s) => s.profile?.id ?? null);
  const { session } = useAuth();
  const email = session?.user?.email || null;

  const [modalOpen, setModalOpen] = useState(false);
  const [nextExpireAt, setNextExpireAt] = useState<string | null>(null);
  const [affected, setAffected] = useState<number>(0);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [nowTick, setNowTick] = useState(0);

  // Tick every second for countdown rendering
  useEffect(() => {
    const t = setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Load initial stats/feed
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const nowIso = new Date().toISOString();

        // Next expiration for pulses affecting this user (as recipient)
        if (profileId) {
          const { data: effects } = await supabase
            .from("resonance_effects")
            .select(
              "id, expires_at, created_at, source_email, source_id, hop, strength"
            )
            .eq("recipient_id", profileId)
            .gte("expires_at", nowIso)
            .order("expires_at", { ascending: true })
            .limit(1);
          if (active) setNextExpireAt(effects?.[0]?.expires_at ?? null);
        }

        // Allies affected where this user (email) is the donor source
        if (email) {
          const { count } = await supabase
            .from("resonance_effects")
            .select("*", { count: "exact", head: true })
            .eq("source_email", email)
            .gte("expires_at", nowIso);
          if (active) setAffected(count || 0);
        }

        // Simple feed: recent relevant pulses (as donor or as recipient)
        if (email || profileId) {
          let query = supabase
            .from("resonance_effects")
            .select(
              "id, created_at, hop, strength, source_email, source_id, recipient_id, amount, expires_at"
            )
            .order("created_at", { ascending: false })
            .limit(10);
          if (email && profileId) {
            query = query.or(
              `source_email.eq.${email},recipient_id.eq.${profileId}`
            );
          } else if (email) {
            query = query.eq("source_email", email);
          } else if (profileId) {
            query = query.eq("recipient_id", profileId);
          }
          const { data } = await query;
          if (active) {
            const items: FeedItem[] = (data || []).map((r: any) => {
              const who = r.source_email || r.source_id || "ally";
              const boost = r.strength
                ? `→ +${Math.round((r.strength || 0) * 5)}% support`
                : "";
              return {
                id: r.id,
                when: fmtRelative(r.created_at),
                text: `Pulse from ${who} (hop ${r.hop}) ${boost}`.trim(),
              };
            });
            setFeed(items);
          }
        }
      } catch {
        // best-effort; silent fail in HUD
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [email, profileId]);

  // Realtime: donation detected for this user -> toast
  useEffect(() => {
    if (!email) return;
    const ch = supabase
      .channel(`donations_${email}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
          filter: `profile_email=eq.${email}`,
        },
        (payload) => {
          const amount = (payload.new as any)?.amount;
          toast.success(
            `Ko-fi donation detected. Pulse triggered (+${amount}).`
          );
        }
      )
      .subscribe();
    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {}
    };
  }, [email]);

  // Realtime: update affected counter on new propagation rows by this donor
  useEffect(() => {
    if (!email) return;
    const ch = supabase
      .channel(`resonance_src_${email}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "resonance_effects",
          filter: `source_email=eq.${email}`,
        },
        () => {
          setAffected((n) => n + 1);
        }
      )
      .subscribe();
    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {}
    };
  }, [email]);

  const kofiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_KOFI_URL || "https://ko-fi.com",
    []
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Active Pulse</span>
        <span className="font-mono tabular-nums">
          {fmtCountdown(nextExpireAt)}
          {nowTick ? "" : ""}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Allies Affected</span>
        <span className="font-mono">{affected}</span>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default">
            Trigger Pulse
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Trigger Resonance</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Your donation will echo through your crew (up to 3 hops).</p>
            <a
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-primary-foreground hover:opacity-90"
              href={kofiUrl}
              target="_blank"
              rel="noreferrer"
            >
              Donate via Ko‑fi
            </a>
            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Recent Resonance
              </div>
              <ul className="space-y-1">
                {feed.map((f) => (
                  <li key={f.id} className="text-xs flex items-center gap-2">
                    <span className="text-muted-foreground w-14">
                      [{f.when}]
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
                {feed.length === 0 ? (
                  <li className="text-xs text-muted-foreground">
                    No recent pulses
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
