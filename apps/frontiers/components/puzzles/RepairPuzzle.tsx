"use client";

import { useEffect, useState } from "react";
import { Switch } from "@workspace/ui/components/switch";
import { Button } from "@workspace/ui/components/button";
import type { ArtSignal } from "@/schemas/art_signals";
import { useSignalsStore } from "@/store/useSignalsStore";
import { supabase } from "@/lib/supabaseClient";
import { useFactionStore } from "@/store/useFactionStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useJournalStore } from "@/store/useJournalStore";
import { useSeasonStore } from "@/store/useSeasonStore";
import { useMissionsStore } from "@/store/useMissionsStore";
import { useAchievementsStore } from "@/store/useAchievementsStore";

type Step = "Calibrate" | "Stabilize" | "Confirm";
const ORDER: Step[] = ["Calibrate", "Stabilize", "Confirm"];

export function RepairPuzzle({ signal }: { signal: ArtSignal }) {
  const markDiscovered = useSignalsStore((s) => s.markDiscovered);
  const [step, setStep] = useState(0);
  const [calibrate, setCalibrate] = useState(false);
  const [stabilize, setStabilize] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(signal.is_discovered === true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (signal.is_discovered) setDone(true);
  }, [signal.is_discovered]);

  function reset() {
    setStep(0);
    setCalibrate(false);
    setStabilize(false);
    setConfirm(false);
    setError(undefined);
  }

  async function complete() {
    setSaving(true);
    setError(undefined);
    try {
      markDiscovered(signal.id);
      // best-effort log to Supabase; ignore errors in Phase 1 stub
      await supabase
        .from("art_signals")
        .update({ is_discovered: true })
        .eq("id", signal.id);
      // Phase 2: Faction reputation increment
      const factionId =
        useProfileStore.getState().region_id ||
        process.env.NEXT_PUBLIC_REGION_ID ||
        "demo-region";
      const multiplier = getDifficultyMultiplier(signal);
      useFactionStore
        .getState()
        .incrementReputation(String(factionId), 5 * multiplier);
      // Engineering XP gain
      useProfileStore.getState().addEngineeringXp(10 * multiplier);
      // Add journal entry
      const kind = labelForSignal(signal);
      useJournalStore.getState().add("repair", `${kind} – ${signal.title}`);
      // Record mission action for active season
      const active = useSeasonStore.getState().active_campaign_id;
      if (active) useMissionsStore.getState().recordAction(active, "repair");
      // Achievements: first repair
      try {
        useAchievementsStore.getState().onRepair();
      } catch {}
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Failed to record repair");
    } finally {
      setSaving(false);
    }
  }

  function onToggle(label: Step, next: boolean) {
    if (done) return;
    // Only care about turning switches on; turning off resets
    if (!next) {
      reset();
      return;
    }
    const expected = ORDER[step];
    if (label !== expected) {
      reset();
      return;
    }
    // Advance
    const nextStep = step + 1;
    setStep(nextStep);
    if (label === "Calibrate") setCalibrate(true);
    if (label === "Stabilize") setStabilize(true);
    if (label === "Confirm") setConfirm(true);
    if (nextStep === ORDER.length) {
      void complete();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Calibrate</span>
        <Switch
          checked={calibrate}
          onCheckedChange={(v) => onToggle("Calibrate", !!v)}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Stabilize</span>
        <Switch
          checked={stabilize}
          onCheckedChange={(v) => onToggle("Stabilize", !!v)}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Confirm</span>
        <Switch
          checked={confirm}
          onCheckedChange={(v) => onToggle("Confirm", !!v)}
        />
      </div>

      {done ? (
        <div className="text-xs text-green-600 dark:text-green-400">
          Repair complete.
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Toggle in order: Calibrate → Stabilize → Confirm.
        </div>
      )}
      {error && <div className="text-xs text-destructive/80">{error}</div>}
      {!done && (
        <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
          Reset
        </Button>
      )}
    </div>
  );
}

function getDifficultyMultiplier(_signal: ArtSignal) {
  // TODO: derive from tags or source_type; default 1 for now
  return 1;
}

function labelForSignal(signal: ArtSignal) {
  const s = (signal.source_type || "").toLowerCase();
  if (s.includes("dispatch")) return "Beacon repaired";
  if (s.includes("class") || s.includes("assembly"))
    return "Assembly completed";
  if (s.includes("session") || s.includes("cache"))
    return "Knowledge Cache decoded";
  return "Signal repaired";
}
