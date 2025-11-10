// components/ShiftIntentionSection.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "../../card.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible.tsx";
import { Label } from "../../label.tsx";
import { Input } from "../../input.tsx";
import { Button } from "../../button.tsx";
import { combineLocalDateTime, cn } from "../../../lib/utils.ts";
import { BaseShiftIntentionFields } from "@workspace/store/types/pod.ts";
import { DateTimePicker } from "../../DateTimePicker.tsx";

// Make the component generic so parent state can have extra fields like tz, dispatchLink, etc.
type Props<T extends BaseShiftIntentionFields> = {
  title?: string;
  form: T;
  setForm: React.Dispatch<React.SetStateAction<T>>;
  onAdd: () => void;
  defaultOpen?: boolean;
  className?: string;
  addButtonText?: string;
};

function isoToLocalParts(iso?: string) {
  if (!iso) {
    return { date: "", time: "" };
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "" };
  }

  const local = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60_000,
  );
  const localIso = local.toISOString();

  return {
    date: localIso.slice(0, 10),
    time: localIso.slice(11, 16),
  };
}

export function ShiftIntentionSection<T extends BaseShiftIntentionFields>({
  title = "Shift intention",
  form,
  setForm,
  onAdd,
  defaultOpen = false,
  className,
  addButtonText = "Add Shift",
}: Props<T>) {
  const [open, setOpen] = React.useState(defaultOpen);
  const startIso =
    combineLocalDateTime(form.startDate, form.startTime) || undefined;
  const endIso = combineLocalDateTime(form.endDate, form.endTime) || undefined;

  const handleStartChange = React.useCallback(
    (iso: string) => {
      const { date, time } = isoToLocalParts(iso);
      setForm((prev) => ({ ...prev, startDate: date, startTime: time }));
    },
    [setForm],
  );

  const handleEndChange = React.useCallback(
    (iso: string) => {
      const { date, time } = isoToLocalParts(iso);
      setForm((prev) => ({ ...prev, endDate: date, endTime: time }));
    },
    [setForm],
  );

  return (
    <Card className={cn("my-4 p-5", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              aria-expanded={open}
            >
              {open ? "Hide" : "Show"}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-4">
          <div className="grid gap-3">
            <Label htmlFor="label">Intention Label</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, label: e.target.value }))
              }
              placeholder="Morning Court Watch"
            />

            {/* Mobile‑friendly pickers */}
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="grid gap-1">
                <DateTimePicker
                  label="Starts At"
                  value={startIso}
                  onChange={handleStartChange}
                />
              </div>

              <div className="grid gap-1">
                <DateTimePicker
                  label="Ends At"
                  value={endIso}
                  onChange={handleEndChange}
                />
              </div>
            </div>

            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g. King County Courthouse"
            />

            <Label htmlFor="needed">How many needed</Label>
            <Input
              id="needed"
              type="number"
              inputMode="numeric"
              value={form.headcount === 0 ? "" : String(form.headcount)}
              onChange={(e) => {
                const val = e.target.value.trim();
                const n =
                  val === "" || Number.isNaN(Number(val))
                    ? 0
                    : Math.max(0, parseInt(val, 10));
                setForm((prev) => ({ ...prev, headcount: n }));
              }}
            />

            <Button className="mt-2" type="button" onClick={onAdd}>
              {addButtonText}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
