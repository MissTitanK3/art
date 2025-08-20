// components/ShiftIntentionSection.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "../../card.tsx";
import { cn } from "@workspace/ui/lib/utils.ts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../collapsible.tsx";
import { Label } from "../../label.tsx";
import { Input } from "../../input.tsx";
import { Button } from "../../button.tsx";

export type BaseShiftIntentionFields = {
  label: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:mm
  location: string;
  headcount: number;
};

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
              <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")} />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-4">
          <div className="grid gap-3">
            <Label htmlFor="label">Intention Label</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Morning Court Watch"
            />

            {/* Mobile‑friendly pickers */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="start-date">Start date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="start-time">Start time</Label>
                <Input
                  id="start-time"
                  type="time"
                  inputMode="numeric"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="end-date">End date</Label>
                <Input
                  id="end-date"
                  type="date"
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="end-time">End time</Label>
                <Input
                  id="end-time"
                  type="time"
                  inputMode="numeric"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
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
                const n = val === "" || Number.isNaN(Number(val)) ? 0 : Math.max(0, parseInt(val, 10));
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
