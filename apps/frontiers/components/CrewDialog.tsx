"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
import { Button } from "@workspace/ui/primitives/button";
import { useShipStore } from "@/store/useShipStore";
import { useJournalStore } from "@/store/useJournalStore";

export function CrewDialog() {
  const morale = useShipStore((s) => s.crew_morale); // 1–100
  const fatigue = useShipStore((s) => s.fatigue); // 0–100
  const journal = useJournalStore((s) => s.entries);

  const moraleLow = morale < 60;
  const fatigueHigh = fatigue > 70;

  const message = useMemo(() => {
    if (fatigueHigh) return "You're pushing too hard, captain.";
    if (moraleLow) return "Crew's running on fumes. Maybe dock soon?";
    return "";
  }, [fatigueHigh, moraleLow]);

  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<{ morale?: boolean; fatigue?: boolean }>(
    {}
  );

  // Trigger when thresholds are crossed, but only once until reset
  useEffect(() => {
    if (fatigueHigh && !shown.fatigue) {
      setOpen(true);
      setShown((s) => ({ ...s, fatigue: true }));
      return;
    }
    if (moraleLow && !shown.morale) {
      setOpen(true);
      setShown((s) => ({ ...s, morale: true }));
      return;
    }
    // Auto-close when conditions improve
    if (!fatigueHigh && !moraleLow) {
      setOpen(false);
    }
  }, [fatigueHigh, moraleLow, shown.fatigue, shown.morale]);

  // Reset flags when a dock event is recorded
  useEffect(() => {
    if (!journal.length) return;
    const latest = journal[0];
    if (latest && latest.kind === "dock") {
      setShown({});
      setOpen(false);
    }
  }, [journal]);

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crew Update</DialogTitle>
          <DialogDescription>Morale and fatigue status</DialogDescription>
        </DialogHeader>
        <p className="text-sm">{message}</p>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} size="sm">
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
