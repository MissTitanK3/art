"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/primitives/button";
import { Calendar } from "@workspace/ui/primitives/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import { TimePickerSelect } from "./time-picker-select";

type Props = {
  label: string;
  value?: string; // ISO string
  onChange: (value: string) => void;
};

export function DateTimePicker({ label, value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  const handleDateChange = (selected?: Date) => {
    if (!selected) return;
    const current = date ?? new Date();
    selected.setHours(current.getHours(), current.getMinutes());
    onChange(selected.toISOString());
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 flex-col sm:flex-row">
        {/* Calendar popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-[200px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[80]" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Native time input */}
        <div className="flex items-center gap-2">
          <TimePickerSelect
            value={date}
            onChange={(newDate) => onChange(newDate.toISOString())}
          />
        </div>
      </div>
    </div>
  );
}
