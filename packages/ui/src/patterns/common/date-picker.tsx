"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/primitives/button";
import { Calendar } from "@workspace/ui/primitives/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/primitives/popover";

type Props = {
  label: string;
  value?: string; // ISO string
  onChange: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
  hideLabel?: boolean;
};

export function DatePicker({
  label,
  value,
  onChange,
  className,
  fullWidth = false,
  hideLabel = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  const buttonLabel = date ? format(date, "PPP") : "Pick a date";

  const handleDateChange = (selected?: Date) => {
    if (!selected) return;
    const next = new Date(selected);
    onChange(next.toISOString());
    setOpen(false);
  };

  return (
    <div className={cn("space-y-1", className)}>
      {!hideLabel ? <label className="text-sm font-medium">{label}</label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              fullWidth ? "w-full" : "w-[200px]",
              !date && "text-muted-foreground",
            )}
            aria-label={label}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[80]" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            captionLayout="dropdown"
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
